from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation
from app.settings.settingsModels import OcrEngine

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    current_user_id = int(get_jwt_identity())

    # Fetch only evaluations belonging to the logged-in user
    all_evaluations = Evaluation.query.filter_by(user_id=current_user_id).all()
    done_evaluations = [e for e in all_evaluations if e.status == "done"]

    total_evaluations = len(all_evaluations)
    average_accuracy = (
        round(sum(e.accuracy or 0 for e in done_evaluations) / len(done_evaluations))
        if done_evaluations else 0
    )

    engines = OcrEngine.query.all()
    engine_leaderboard = []
    for engine in engines:
        engine_evals = [e for e in done_evaluations if e.engine_id == engine.id]
        avg = round(sum(e.accuracy or 0 for e in engine_evals) / len(engine_evals)) if engine_evals else None
        engine_leaderboard.append({
            "id": engine.id,
            "code": engine.code,
            "name": engine.name,
            "average_accuracy": avg,
            "evaluation_count": len(engine_evals)
        })
    engine_leaderboard.sort(key=lambda e: (e["average_accuracy"] is None, -(e["average_accuracy"] or 0)))

    recent = sorted(all_evaluations, key=lambda e: e.created_at, reverse=True)[:5]

    return jsonify({
        "total_evaluations": total_evaluations,
        "average_accuracy": average_accuracy,
        "engines_compared": len(engines),
        "last_run": recent[0].created_at.isoformat() if recent else None,
        "engine_leaderboard": engine_leaderboard,
        "recent_evaluations": [
            {
                "id": e.id,
                "file_name": e.file_name,
                "engine_name": e.engine.name,
                "status": e.status,
                "accuracy": e.accuracy,
                "created_at": e.created_at.isoformat()
            }
            for e in recent
        ]
    }), 200