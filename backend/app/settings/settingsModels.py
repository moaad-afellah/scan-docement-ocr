from backend.extention import db

class OcrEngine(db.Model):
    __tablename__ = 'ocr_engines'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)

    evaluations = db.relationship('Evaluation', backref='engine')
    default_for_settings = db.relationship('UserSettings', backref='default_engine')


class UserSettings(db.Model):
    __tablename__ = 'user_settings'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    default_engine_id = db.Column(db.Integer, db.ForeignKey('ocr_engines.id'), nullable=True)
    language = db.Column(db.String(20), default='en')
    email_alerts = db.Column(db.Boolean, default=True)
    completion_alerts = db.Column(db.Boolean, default=True)
    weekly_summary = db.Column(db.Boolean, default=False)
    default_export_fmt = db.Column(db.String(20), default='pdf')
    include_original = db.Column(db.Boolean, default=True)