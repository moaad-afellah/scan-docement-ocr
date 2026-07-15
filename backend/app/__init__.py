from flask import Flask
from config import Config
from extention import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    from app.auth.authRoutes import main
    from app.ocrWorkspace.ocrWorkspaceRoutes import ocr_workspace_bp

    app.register_blueprint(main)
    app.register_blueprint(ocr_workspace_bp)

    with app.app_context():
        db.create_all()

    return app