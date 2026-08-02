"""
NEW FILE.

Tracks async batch-upload jobs so the "Process" screen in the UI (the one
showing "1/1 completed" with a per-file checklist) has something real to
poll instead of blocking on one giant synchronous request.

ASSUMPTION TO VERIFY:
  The foreign keys below (`document_types.id`, `ocr_engines.id`,
  `evaluations.id`, `users.id`) assume your existing models use those
  exact __tablename__ values. You already have `ocr_engines` and `users`
  confirmed from settingsModels.py / authModels.py. Please double check
  the __tablename__ on your DocumentType and Evaluation models
  (ocrWorkspaceModelsUpload.py / ocrWorkspaceModelsProcess.py) match
  'document_types' and 'evaluations' -- if they don't, update the
  db.ForeignKey(...) strings below to match.
"""
    
import uuid
from datetime import datetime
from extention import db


def generate_job_id():
    return uuid.uuid4().hex


class BatchJob(db.Model):
    __tablename__ = 'batch_jobs'

    id = db.Column(db.String(32), primary_key=True, default=generate_job_id)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_types.id'), nullable=False)
    engine_id = db.Column(db.Integer, db.ForeignKey('ocr_engines.id'), nullable=False)

    # pending -> processing -> completed (or failed if something fatal happens
    # before any per-file processing could even start)
    status = db.Column(db.String(20), default='pending', nullable=False)

    total_files = db.Column(db.Integer, default=0, nullable=False)
    completed_files = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    files = db.relationship(
        'BatchJobFile',
        backref='job',
        cascade='all, delete-orphan',
        order_by='BatchJobFile.position'
    )


class BatchJobFile(db.Model):
    __tablename__ = 'batch_job_files'

    id = db.Column(db.Integer, primary_key=True)
    batch_job_id = db.Column(db.String(32), db.ForeignKey('batch_jobs.id'), nullable=False)

    file_name = db.Column(db.String(255), nullable=False)   # sanitized original name, for display
    file_path = db.Column(db.String(500), nullable=False)   # actual path on disk, for OCR processing

    # pending -> processing -> done | error
    status = db.Column(db.String(20), default='pending', nullable=False)

    evaluation_id = db.Column(db.Integer, db.ForeignKey('evaluations.id'), nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, default=0, nullable=False)

    evaluation = db.relationship('Evaluation')