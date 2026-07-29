from extention import db
from datetime import datetime

class Evaluation(db.Model):
    __tablename__ = 'evaluations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_types.id'), nullable=False)
    engine_id = db.Column(db.Integer, db.ForeignKey('ocr_engines.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)      # "Untitled (1).pdf"
    file_size = db.Column(db.Integer, nullable=True)
    file_path = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # "Extraction complete"
    error_message = db.Column(db.Text, nullable=True)
    accuracy = db.Column(db.Integer, nullable=True)             # "0%"
    correct_count = db.Column(db.Integer, default=0)            # "0 CORRECT"
    incorrect_count = db.Column(db.Integer, default=0)          # "5 INCORRECT"
    missing_count = db.Column(db.Integer, default=0)            # "0 MISSING"
    additional_count = db.Column(db.Integer, default=0)         # "0 ADDITIONAL"
    total_count = db.Column(db.Integer, default=0)
    raw_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    fields = db.relationship('EvaluationField', backref='evaluation', cascade='all, delete-orphan')