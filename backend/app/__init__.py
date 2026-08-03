from flask import Flask
from flask_cors import CORS
from sqlalchemy import inspect, text
from backend.config import Config
from backend.extention import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
    )
    db.init_app(app)
    jwt.init_app(app)

    from backend.app.auth.authModels import User
    from backend.app.settings.settingsModels import OcrEngine, UserSettings
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsUpload import (
        CANONICAL_DOCUMENT_TYPE_CODES,
        DocumentType,
        DocumentTypeField,
    )
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsReview import EvaluationField
    # NEW: registers the async batch-job tables (BatchJob, BatchJobFile)
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsBatch import BatchJob, BatchJobFile

    from backend.app.auth.authRoutes import main
    from backend.app.ocrWorkspace.ocrWorkspaceRoutes import ocr_workspace_bp
    from backend.app.settings.settingsRoutes import settings_bp
    from backend.app.dashboard.dashboardRoutes import dashboard_bp
    from backend.app.history.historyRoutes import history_bp

    app.register_blueprint(main)
    app.register_blueprint(ocr_workspace_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(history_bp)

    with app.app_context():
        db.create_all()
        _ensure_raw_text_column(app)
        seed_initial_data()

    return app


def _ensure_raw_text_column(app):
    inspector = inspect(db.engine)
    if "evaluations" in inspector.get_table_names():
        existing_columns = {col["name"] for col in inspector.get_columns("evaluations")}
        if "raw_text" not in existing_columns:
            db.session.execute(text("ALTER TABLE evaluations ADD COLUMN raw_text TEXT"))
            db.session.commit()


def seed_initial_data():
    from backend.app.settings.settingsModels import OcrEngine
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsBatch import BatchJob
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation
    from backend.app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsUpload import (
        CANONICAL_DOCUMENT_TYPE_CODES,
        DocumentType,
        DocumentTypeField,
    )

    # Seed the engines that are actually supported by the current OCR
    # dispatcher so the backend and frontend remain in sync.
    default_engines = [
        {"code": "pytesseract", "name": "SwiftScan Lite", "description": "Lightweight, fast general-purpose OCR engine"},
        {"code": "easyocr", "name": "LexoNet Multilingual", "description": "Deep learning based OCR engine supporting 80+ languages"},
        {"code": "tesseract-js", "name": "VisionOCR Pro", "description": "High-accuracy general-purpose OCR microservice"},
    ]

    for engine_data in default_engines:
        existing = OcrEngine.query.filter_by(code=engine_data["code"]).first()
        if not existing:
            db.session.add(OcrEngine(**engine_data))
        else:
            # Keep names/descriptions in sync if this seed changes later,
            # without touching the id/code that other rows reference.
            existing.name = engine_data["name"]
            existing.description = engine_data["description"]

    default_doc_types = [
        {
            "code": "national_id_card",
            "name": "National ID Card",
            "fields": [
                {"label": "Last Name", "position": 1},
                {"label": "First Name", "position": 2},
                {"label": "Date of Birth", "position": 3},
                {"label": "Valid Until", "position": 4},
                {"label": "Card Number", "position": 5}
            ]
        },
        {
            "code": "passport",
            "name": "Passport",
            "fields": [
                {"label": "Surname", "position": 1},
                {"label": "Given Names", "position": 2},
                {"label": "Passport Number", "position": 3},
                {"label": "Date of Birth", "position": 4},
                {"label": "Expiry Date", "position": 5}
            ]
        },
        {
            "code": "invoice",
            "name": "Invoice",
            "fields": [
                {"label": "Invoice Number", "position": 1},
                {"label": "Invoice Date", "position": 2},
                {"label": "Vendor Name", "position": 3},
                {"label": "Total Amount", "position": 4},
                {"label": "Tax Amount", "position": 5},
                {"label": "Due Date", "position": 6}
            ]
        }
    ]

    canonical_id_by_code = {}
    for dt_data in default_doc_types:
        dt = DocumentType.query.filter_by(code=dt_data["code"]).first()
        if not dt:
            dt = DocumentType(code=dt_data["code"], name=dt_data["name"])
            db.session.add(dt)
            db.session.flush()

        dt.name = dt_data["name"]
        canonical_id_by_code[dt.code] = dt.id

        desired_fields = {f_data["label"]: f_data["position"] for f_data in dt_data["fields"]}
        for field in list(dt.fields):
            if field.label not in desired_fields:
                db.session.delete(field)

        for label, position in desired_fields.items():
            field = next((field for field in dt.fields if field.label == label), None)
            if field is None:
                field = DocumentTypeField(document_type_id=dt.id, label=label, position=position)
                db.session.add(field)
            else:
                field.position = position

    db.session.flush()

    fallback_document_type_id = canonical_id_by_code.get("national_id_card")
    if fallback_document_type_id is None:
        fallback_document_type_id = (
            DocumentType.query.filter_by(code="national_id_card").first().id
            if DocumentType.query.filter_by(code="national_id_card").first()
            else None
        )

    existing_doc_types = DocumentType.query.all()
    for doc_type in existing_doc_types:
        if doc_type.code in CANONICAL_DOCUMENT_TYPE_CODES:
            continue

        if fallback_document_type_id is not None:
            Evaluation.query.filter_by(document_type_id=doc_type.id).update(
                {Evaluation.document_type_id: fallback_document_type_id},
                synchronize_session=False,
            )
            BatchJob.query.filter_by(document_type_id=doc_type.id).update(
                {"document_type_id": fallback_document_type_id},
                synchronize_session=False,
            )

        db.session.delete(doc_type)

    db.session.commit()