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

    return app