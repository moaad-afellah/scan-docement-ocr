from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extention import db
from backend.app.settings.settingsModels import UserSettings, OcrEngine
from backend.app.ocrWorkspace.ocrWorkspaceServices.ocrWorkspaceServicesProcess import get_supported_engine_codes

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings", methods=["GET"])
@settings_bp.route("/settings/<int:user_id>", methods=["GET"])
@jwt_required()
def get_settings(user_id=None):
    current_user_id = int(get_jwt_identity())
    target_user_id = user_id if user_id is not None else current_user_id

    if current_user_id != target_user_id:
        return jsonify({"error": "You can only view your own settings"}), 403

    settings = UserSettings.query.filter_by(user_id=target_user_id).first()
    if not settings:
        settings = UserSettings(user_id=target_user_id)
        db.session.add(settings)
        db.session.commit()

    return jsonify({
        "user_id": settings.user_id,
        "default_engine_id": settings.default_engine_id,
        "language": settings.language,
        "email_alerts": settings.email_alerts,
        "completion_alerts": settings.completion_alerts,
        "weekly_summary": settings.weekly_summary,
        "default_export_fmt": settings.default_export_fmt,
        "include_original": settings.include_original
    }), 200


@settings_bp.route("/settings", methods=["PUT"])
@settings_bp.route("/settings/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_settings(user_id=None):
    current_user_id = int(get_jwt_identity())
    target_user_id = user_id if user_id is not None else current_user_id

    if current_user_id != target_user_id:
        return jsonify({"error": "You can only update your own settings"}), 403

    settings = UserSettings.query.filter_by(user_id=target_user_id).first()
    if not settings:
        settings = UserSettings(user_id=target_user_id)
        db.session.add(settings)

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    for key in ["default_engine_id", "language", "email_alerts", "completion_alerts",
                "weekly_summary", "default_export_fmt", "include_original"]:
        if key in data:
            setattr(settings, key, data[key])

    db.session.commit()
    return jsonify({
        "user_id": settings.user_id,
        "default_engine_id": settings.default_engine_id,
        "language": settings.language,
        "email_alerts": settings.email_alerts,
        "completion_alerts": settings.completion_alerts,
        "weekly_summary": settings.weekly_summary,
        "default_export_fmt": settings.default_export_fmt,
        "include_original": settings.include_original
    }), 200


@settings_bp.route("/ocr-engines", methods=["GET"])
def list_ocr_engines():
    supported_codes = set(get_supported_engine_codes())
    engines = OcrEngine.query.filter(OcrEngine.code.in_(supported_codes)).all()
    return jsonify([
        {
          "id": engine.id,
          "code": engine.code,
          "name": engine.name,
          "description": engine.description
        }
        for engine in engines
    ]), 200


@settings_bp.route("/ocr-engines", methods=["POST"])
@jwt_required()
def create_ocr_engine():
    # Optional: Add role check here if you only want admins to create engines
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    code = data.get("code")
    name = data.get("name")
    description = data.get("description")

    if not code or not name:
        return jsonify({"error": "code and name are required"}), 400

    existing_engine = OcrEngine.query.filter_by(code=code).first()
    if existing_engine:
        return jsonify({"error": "An engine with this code already exists"}), 409

    new_engine = OcrEngine(
        code=code,
        name=name,
        description=description
    )
    db.session.add(new_engine)
    db.session.commit()

    return jsonify({
        "id": new_engine.id,
        "code": new_engine.code,
        "name": new_engine.name,
        "description": new_engine.description
    }), 201