from flask import Blueprint, request, jsonify
from extention import db
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation

history_bp = Blueprint("history", __name__)


# GET all evaluations with filters and sorting
@history_bp.route("/history", methods=["GET"])
def list_evaluations():
    query = Evaluation.query

    # Search by file name
    search = request.args.get("search")
    if search:
        query = query.filter(
            Evaluation.file_name.ilike(f"%{search}%")
        )

    # Filter by OCR engine
    engine_id = request.args.get("engine_id")
    if engine_id:
        query = query.filter(
            Evaluation.engine_id == engine_id
        )

    # Sorting
    sort = request.args.get("sort", "date_desc")

    if sort == "date_desc":
        query = query.order_by(
            Evaluation.created_at.desc()
        )

    elif sort == "date_asc":
        query = query.order_by(
            Evaluation.created_at.asc()
        )

    elif sort == "accuracy_desc":
        query = query.order_by(
            Evaluation.accuracy.desc()
        )

    elif sort == "accuracy_asc":
        query = query.order_by(
            Evaluation.accuracy.asc()
        )

    evaluations = query.all()

    return jsonify([
        {
            "id": evaluation.id,
            "file_name": evaluation.file_name,
            "document_type_name": (
                evaluation.document_type.name
                if evaluation.document_type
                else None
            ),
            "engine_name": (
                evaluation.engine.name
                if evaluation.engine
                else None
            ),
            "status": evaluation.status,
            "accuracy": evaluation.accuracy,
            "created_at": (
                evaluation.created_at.isoformat()
                if evaluation.created_at
                else None
            )
        }
        for evaluation in evaluations
    ]), 200



# DELETE evaluation by id
@history_bp.route("/history/<int:evaluation_id>", methods=["DELETE"])
def delete_evaluation(evaluation_id):

    evaluation = Evaluation.query.get(evaluation_id)

    if not evaluation:
        return jsonify({
            "error": "Evaluation not found"
        }), 404

    db.session.delete(evaluation)
    db.session.commit()

    return jsonify({
        "message": f"Evaluation {evaluation_id} deleted successfully"
    }), 200