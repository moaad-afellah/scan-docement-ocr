from flask import Blueprint, request, jsonify
from extention import db
from app.auth.authModels import User


main = Blueprint('main', __name__)

@main.route('/', methods=['POST'])
def creat_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400
    new_user = User(
        email=data['email'],
        password=data['password']
        )
    db.session.add(new_user)
    db.session.commit()
    

    return jsonify(new_user.to_dict()),201