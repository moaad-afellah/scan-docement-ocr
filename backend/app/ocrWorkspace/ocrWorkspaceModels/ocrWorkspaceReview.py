from extention import db

class EvaluationField(db.Model):
    __tablename__ = 'evaluation_fields'

    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.Integer, db.ForeignKey('evaluations.id'), nullable=False)
    label = db.Column(db.String(120), nullable=False)          # "Merchant Name"
    ocr_value = db.Column(db.Text, nullable=True)               # "Union Hardware"
    reference_value = db.Column(db.Text, nullable=True)         # "knkn" (user typed)
    status = db.Column(db.String(50), nullable=True)            # "mismatch"
    position = db.Column(db.Integer, nullable=False)            # row order