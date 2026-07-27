from flask import Blueprint, request, jsonify
from extention import db
from app.settings.settingsModels import UserSettings, OcrEngine

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings/<int:user_id>", methods=["GET"])
def get_settings(user_id):
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({"error": "Settings not found for this user"}), 404
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


@settings_bp.route("/settings/<int:user_id>", methods=["PUT"])
def update_settings(user_id):
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({"error": "Settings not found for this user"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    for key in ["default_engine_id", "language", "email_alerts", "completion_alerts",
                "weekly_summary", "default_export_fmt", "include_original"]:
        if key in data:
            setattr(settings, key, data[key])

    db.session.commit()
    return jsonify({key: getattr(settings, key) for key in data.keys()}), 200


@settings_bp.route("/ocr-engines", methods=["GET"])
def list_ocr_engines():
    engines = OcrEngine.query.all()
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
def create_ocr_engine():
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