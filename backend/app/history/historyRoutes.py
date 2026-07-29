from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extention import db
from app.ocrWorkspace.ocrWorkspaceModels.ocrWorkspaceModelsProcess import Evaluation

history_bp = Blueprint("history", __name__)


# GET all evaluations with filters and sorting for the current user
@history_bp.route("/history", methods=["GET"])
@jwt_required()
def list_evaluations():
    current_user_id = int(get_jwt_identity())
    
    # Restrict query strictly to the logged-in user's evaluations
    query = Evaluation.query.filter_by(user_id=current_user_id)

    # Search by file name
    search = request.args.get("search")
    if search:
        query = query.filter(
            Evaluation.file_name.ilike(f"%{search}%")
        )

    # Filter by OCR engine
    engine_id = request.args.get("engine_id")
    if engine_id:
        query = query.filter(
            Evaluation.engine_id == engine_id
        )

    # Sorting
    sort = request.args.get("sort", "date_desc")

    if sort == "date_desc":
        query = query.order_by(
            Evaluation.created_at.desc()
        )

    elif sort == "date_asc":
        query = query.order_by(
            Evaluation.created_at.asc()
        )

    elif sort == "accuracy_desc":
        query = query.order_by(
            Evaluation.accuracy.desc()
        )

    elif sort == "accuracy_asc":
        query = query.order_by(
            Evaluation.accuracy.asc()
        )

    evaluations = query.all()

    return jsonify([
        {
            "id": evaluation.id,
            "file_name": evaluation.file_name,
            "document_type_name": (
                evaluation.document_type.name
                if evaluation.document_type
                else None
            ),
            "engine_name": (
                evaluation.engine.name
                if evaluation.engine
                else None
            ),
            "status": evaluation.status,
            "accuracy": evaluation.accuracy,
            "created_at": (
                evaluation.created_at.isoformat()
                if evaluation.created_at
                else None
            )
        }
        for evaluation in evaluations
    ]), 200



# DELETE evaluation by id (restricted to owner)
@history_bp.route("/history/<int:evaluation_id>", methods=["DELETE"])
@jwt_required()
def delete_evaluation(evaluation_id):
    evaluation = Evaluation.query.get(evaluation_id)

    if not evaluation:
        return jsonify({
            "error": "Evaluation not found"
        }), 404

    current_user_id = int(get_jwt_identity())
    if evaluation.user_id != current_user_id:
        return jsonify({
            "error": "Unauthorized to delete this evaluation"
        }), 403

    db.session.delete(evaluation)
    db.session.commit()

    return jsonify({
        "message": f"Evaluation {evaluation_id} deleted successfully"
    }), 200