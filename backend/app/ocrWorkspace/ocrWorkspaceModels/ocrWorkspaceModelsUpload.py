from backend.extention import db

CANONICAL_DOCUMENT_TYPE_CODES = ("national_id_card", "passport", "invoice")


class DocumentType(db.Model):
    __tablename__ = 'document_types'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)             # "ID Document"

    fields = db.relationship('DocumentTypeField', backref='document_type', cascade='all, delete-orphan')
    evaluations = db.relationship('Evaluation', backref='document_type')


class DocumentTypeField(db.Model):
    __tablename__ = 'document_type_fields'

    id = db.Column(db.Integer, primary_key=True)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_types.id'), nullable=False)
    label = db.Column(db.String(120), nullable=False)            # defines "Merchant Name", "Total Amount", etc. per doc type
    position = db.Column(db.Integer, nullable=False)