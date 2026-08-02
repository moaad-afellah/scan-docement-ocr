from flask import Flask
from flask_cors import CORS
from config import Config
from extention import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    from app.auth.authModels import User
    from app.settings.settingsModels import OcrEngine, UserSettings
    from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsUpload import DocumentType, DocumentTypeField
    from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation
    from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsReview import EvaluationField
    # NEW: registers the async batch-job tables (BatchJob, BatchJobFile)
    from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsBatch import BatchJob, BatchJobFile

    from app.auth.authRoutes import main
    from app.ocrWorkspace.ocrWorkspaceRoutes import ocr_workspace_bp
    from app.settings.settingsRoutes import settings_bp
    from app.dashboard.dashboardRoutes import dashboard_bp
    from app.history.historyRoutes import history_bp

    app.register_blueprint(main)
    app.register_blueprint(ocr_workspace_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(history_bp)

    with app.app_context():
        db.create_all()
        seed_initial_data()

    return app


def seed_initial_data():
    from app.settings.settingsModels import OcrEngine
    from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsUpload import DocumentType, DocumentTypeField

    # CHANGED: renamed to match the engine names actually shown in the UI
    # (Dashboard leaderboard, Workspace dropdown, Settings default engine).
    # Codes are left untouched so run_ocr()'s existing dispatch logic for
    # "pytesseract" / "easyocr" / "tesseract-js" keeps working unmodified.
    #
    # NOTE: "docmind" is a NEW 4th engine to match the UI's 4-engine layout.
    # It has no backing implementation yet -- you'll need to add a branch
    # for engine.code == "docmind" in ocrWorkspaceServicesProcess.run_ocr(),
    # or point it at one of the existing OCR backends, before it will
    # actually process files instead of erroring out.
    default_engines = [
        {"code": "pytesseract", "name": "SwiftScan Lite", "description": "Lightweight, fast general-purpose OCR engine"},
        {"code": "easyocr", "name": "LexoNet Multilingual", "description": "Deep learning based OCR engine supporting 80+ languages"},
        {"code": "tesseract-js", "name": "VisionOCR Pro", "description": "High-accuracy general-purpose OCR microservice"},
        {"code": "docmind", "name": "DocuMind Enterprise", "description": "Enterprise-grade document extraction engine"},
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
        },
        {
            "code": "receipt",
            "name": "Receipt",
            "fields": [
                {"label": "Merchant Name", "position": 1},
                {"label": "Receipt Date", "position": 2},
                {"label": "Total Amount", "position": 3},
                {"label": "Tax Amount", "position": 4}
            ]
        },
        {
            "code": "id_document",
            "name": "ID Document",
            "fields": [
                {"label": "First Name", "position": 1},
                {"label": "Last Name", "position": 2},
                {"label": "ID Number", "position": 3},
                {"label": "Date of Birth", "position": 4},
                {"label": "Expiry Date", "position": 5}
            ]
        },
        {
            "code": "business_card",
            "name": "Business Card",
            "fields": [
                {"label": "Full Name", "position": 1},
                {"label": "Company", "position": 2},
                {"label": "Email", "position": 3},
                {"label": "Phone Number", "position": 4}
            ]
        }
    ]

    for dt_data in default_doc_types:
        dt = DocumentType.query.filter_by(code=dt_data["code"]).first()
        if not dt:
            dt = DocumentType(code=dt_data["code"], name=dt_data["name"])
            db.session.add(dt)
            db.session.flush()

            for f_data in dt_data["fields"]:
                field = DocumentTypeField(document_type_id=dt.id, label=f_data["label"], position=f_data["position"])
                db.session.add(field)

    db.session.commit()