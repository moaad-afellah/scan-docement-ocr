import os
from flask import Blueprint, request, jsonify, send_file
from extention import db
from app.ocrWorkspace.ocrWorkspaceServices.ocrWorkspaceServicesProcess import run_ocr
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsUpload import DocumentType, DocumentTypeField
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsReview import EvaluationField

ocr_workspace_bp = Blueprint("ocr_workspace", __name__)

UPLOAD_FOLDER = "uploads"


@ocr_workspace_bp.route("/test-ocr", methods=["POST"])
def test_ocr():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    engine = request.form.get("engine", "pytesseract")

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        result = run_ocr(file_path, engine=engine)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result), 200


@ocr_workspace_bp.route("/document-types", methods=["GET"])
def list_document_types():
    doc_types = DocumentType.query.all()
    return jsonify([
        {
            "id": dt.id,
            "code": dt.code,
            "name": dt.name,
            "fields": [
                {"id": f.id, "label": f.label, "position": f.position}
                for f in sorted(dt.fields, key=lambda f: f.position)
            ]
        }
        for dt in doc_types
    ]), 200


@ocr_workspace_bp.route("/document-types", methods=["POST"])
def create_document_type():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    code = data.get("code")
    name = data.get("name")
    if not code or not name:
        return jsonify({"error": "code and name are required"}), 400

    existing = DocumentType.query.filter_by(code=code).first()
    if existing:
        return jsonify({"error": "A document type with this code already exists"}), 409

    new_doc_type = DocumentType(code=code, name=name)
    db.session.add(new_doc_type)
    db.session.commit()

    return jsonify({"id": new_doc_type.id, "code": new_doc_type.code, "name": new_doc_type.name, "fields": []}), 201


@ocr_workspace_bp.route("/document-types/<int:doc_type_id>/fields", methods=["POST"])
def add_document_type_field(doc_type_id):
    doc_type = DocumentType.query.get(doc_type_id)
    if not doc_type:
        return jsonify({"error": "Document type not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    # Accept either a single field object {...} or a list of field objects [{...}, {...}]
    fields_to_create = data if isinstance(data, list) else [data]

    created_fields = []
    for field_data in fields_to_create:
        label = field_data.get("label")
        position = field_data.get("position")
        if not label or position is None:
            return jsonify({"error": "label and position are required for every field"}), 400

        new_field = DocumentTypeField(document_type_id=doc_type_id, label=label, position=position)
        db.session.add(new_field)
        created_fields.append(new_field)

    db.session.commit()

    return jsonify([
        {
            "id": f.id,
            "document_type_id": f.document_type_id,
            "label": f.label,
            "position": f.position
        }
        for f in created_fields
    ]), 201


@ocr_workspace_bp.route("/evaluations", methods=["POST"])
def create_evaluation():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    engine_id = request.form.get("engine_id")
    document_type_id = request.form.get("document_type_id")
    user_id = request.form.get("user_id")

    if not engine_id or not document_type_id or not user_id:
        return jsonify({"error": "engine_id, document_type_id, and user_id are required"}), 400

    doc_type = DocumentType.query.get(document_type_id)
    if not doc_type:
        return jsonify({"error": "Document type not found"}), 404

    from app.settings.settingsModels import OcrEngine
    engine = OcrEngine.query.get(engine_id)
    if not engine:
        return jsonify({"error": "OCR engine not found"}), 404

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    file_size = os.path.getsize(file_path)

    new_evaluation = Evaluation(
        user_id=user_id,
        document_type_id=document_type_id,
        engine_id=engine_id,
        file_name=file.filename,
        file_size=file_size,
        file_path=file_path,
        status='pending'
    )
    db.session.add(new_evaluation)
    db.session.flush()

    try:
        sorted_fields = sorted(doc_type.fields, key=lambda f: f.position)
        field_labels = [f.label for f in sorted_fields]

        ocr_result = run_ocr(file_path, engine=engine.code, field_labels=field_labels)
        extracted_fields = ocr_result.get("fields", {})

        for field_def in sorted_fields:
            key = field_def.label.lower().replace(" ", "_")
            ocr_value = extracted_fields.get(key)

            eval_field = EvaluationField(
                evaluation_id=new_evaluation.id,
                label=field_def.label,
                ocr_value=ocr_value,
                reference_value=None,
                status='pending',
                position=field_def.position
            )
            db.session.add(eval_field)

        new_evaluation.status = 'done'

    except Exception as e:
        new_evaluation.status = 'error'
        new_evaluation.error_message = str(e)

    db.session.commit()

    return jsonify({
        "id": new_evaluation.id,
        "status": new_evaluation.status,
        "error_message": new_evaluation.error_message,
        "fields": [
            {
                "id": f.id,
                "label": f.label,
                "ocr_value": f.ocr_value,
                "position": f.position
            }
            for f in sorted(new_evaluation.fields, key=lambda f: f.position)
        ]
    }), 201

@ocr_workspace_bp.route("/evaluations/<int:evaluation_id>/fields", methods=["PUT"])
def submit_reference_values(evaluation_id):
    evaluation = Evaluation.query.get(evaluation_id)
    if not evaluation:
        return jsonify({"error": "Evaluation not found"}), 404

    data = request.get_json()
    if not data or "fields" not in data:
        return jsonify({"error": "fields data is required"}), 400

    for eval_field in evaluation.fields:
        field_data = data["fields"].get(str(eval_field.id))
        if field_data:
            eval_field.reference_value = field_data.get("reference_value")
            eval_field.status = field_data.get("status")

    evaluation.correct_count = data.get("correct_count", 0)
    evaluation.incorrect_count = data.get("incorrect_count", 0)
    evaluation.missing_count = data.get("missing_count", 0)
    evaluation.additional_count = data.get("additional_count", 0)
    evaluation.total_count = data.get("total_count", 0)
    evaluation.accuracy = data.get("accuracy", 0)

    db.session.commit()

    return jsonify({
        "id": evaluation.id,
        "accuracy": evaluation.accuracy,
        "correct_count": evaluation.correct_count,
        "incorrect_count": evaluation.incorrect_count,
        "missing_count": evaluation.missing_count,
        "additional_count": evaluation.additional_count,
        "total_count": evaluation.total_count,
        "fields": [
            {
                "label": f.label,
                "ocr_value": f.ocr_value,
                "reference_value": f.reference_value,
                "status": f.status
            }
            for f in sorted(evaluation.fields, key=lambda f: f.position)
        ]
    }), 200

@ocr_workspace_bp.route("/evaluations/<int:evaluation_id>", methods=["GET"])
def get_evaluation(evaluation_id):
    evaluation = Evaluation.query.get(evaluation_id)
    if not evaluation:
        return jsonify({"error": "Evaluation not found"}), 404

    return jsonify({
        "id": evaluation.id,
        "user_id": evaluation.user_id,
        "document_type_id": evaluation.document_type_id,
        "engine_id": evaluation.engine_id,
        "file_name": evaluation.file_name,
        "status": evaluation.status,
        "accuracy": evaluation.accuracy,
        "correct_count": evaluation.correct_count,
        "incorrect_count": evaluation.incorrect_count,
        "missing_count": evaluation.missing_count,
        "additional_count": evaluation.additional_count,
        "total_count": evaluation.total_count,
        "created_at": evaluation.created_at.isoformat(),
        "fields": [
            {
                "label": f.label,
                "ocr_value": f.ocr_value,
                "reference_value": f.reference_value,
                "status": f.status,
                "position": f.position
            }
            for f in sorted(evaluation.fields, key=lambda f: f.position)
        ]
    }), 200


@ocr_workspace_bp.route("/evaluations", methods=["GET"])
def list_evaluations():
    evaluations = Evaluation.query.order_by(Evaluation.created_at.desc()).all()

    return jsonify([
        {
            "id": e.id,
            "file_name": e.file_name,
            "status": e.status,
            "accuracy": e.accuracy,
            "created_at": e.created_at.isoformat()
        }
        for e in evaluations
    ]), 200


@ocr_workspace_bp.route("/evaluations/<int:evaluation_id>/file", methods=["GET"])
def get_evaluation_file(evaluation_id):
    evaluation = Evaluation.query.get(evaluation_id)
    if not evaluation:
        return jsonify({"error": "Evaluation not found"}), 404

    if not evaluation.file_path or not os.path.exists(evaluation.file_path):
        return jsonify({"error": "File not found on server"}), 404

    return send_file(evaluation.file_path)

@ocr_workspace_bp.route("/evaluations/batch", methods=["POST"])
def create_evaluations_batch():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files provided"}), 400

    engine_id = request.form.get("engine_id")
    document_type_id = request.form.get("document_type_id")
    user_id = request.form.get("user_id")

    if not engine_id or not document_type_id or not user_id:
        return jsonify({"error": "engine_id, document_type_id, and user_id are required"}), 400

    doc_type = DocumentType.query.get(document_type_id)
    if not doc_type:
        return jsonify({"error": "Document type not found"}), 404

    from app.settings.settingsModels import OcrEngine
    engine = OcrEngine.query.get(engine_id)
    if not engine:
        return jsonify({"error": "OCR engine not found"}), 404

    results = []
    for file in files:
        if file.filename == "":
            continue

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        file_size = os.path.getsize(file_path)

        new_evaluation = Evaluation(
            user_id=user_id,
            document_type_id=document_type_id,
            engine_id=engine_id,
            file_name=file.filename,
            file_size=file_size,
            file_path=file_path,
            status='pending'
        )
        db.session.add(new_evaluation)
        db.session.flush()

        try:
            sorted_fields = sorted(doc_type.fields, key=lambda f: f.position)
            field_labels = [f.label for f in sorted_fields]

            ocr_result = run_ocr(file_path, engine=engine.code, field_labels=field_labels)
            extracted_fields = ocr_result.get("fields", {})

            for field_def in sorted_fields:
                key = field_def.label.lower().replace(" ", "_")
                ocr_value = extracted_fields.get(key)

                eval_field = EvaluationField(
                    evaluation_id=new_evaluation.id,
                    label=field_def.label,
                    ocr_value=ocr_value,
                    reference_value=None,
                    status='pending',
                    position=field_def.position
                )
                db.session.add(eval_field)

            new_evaluation.status = 'done'

        except Exception as e:
            new_evaluation.status = 'error'
            new_evaluation.error_message = str(e)

        results.append({
            "id": new_evaluation.id,
            "file_name": new_evaluation.file_name,
            "status": new_evaluation.status,
            "error_message": new_evaluation.error_message
        })

    db.session.commit()

    return jsonify(results), 201