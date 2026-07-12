from flask import Flask
from config import Config
from extention import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)  # connects SQLAlchemy to PostgreSQL here

    from .auth.routes import main
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()  # creates tables based on models.py

    return app