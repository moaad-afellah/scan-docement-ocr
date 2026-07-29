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

    default_engines = [
        {"code": "pytesseract", "name": "PyTesseract", "description": "Open-source Tesseract OCR engine wrapper for Python"},
        {"code": "easyocr", "name": "EasyOCR", "description": "Deep learning based OCR engine supporting 80+ languages"},
        {"code": "tesseract-js", "name": "VisionOCR Pro", "description": "High-accuracy general-purpose Tesseract.js microservice"}
    ]

    for engine_data in default_engines:
        if not OcrEngine.query.filter_by(code=engine_data["code"]).first():
            db.session.add(OcrEngine(**engine_data))

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