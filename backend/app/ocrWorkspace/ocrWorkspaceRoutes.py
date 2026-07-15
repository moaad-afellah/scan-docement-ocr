import os
from flask import Blueprint, jsonify, request
from app.ocrWorkspace.ocrWorkspaceServices.ocrWorkspaceServicesProcess import run_ocr


ocr_workspace_bp = Blueprint('ocr_workspace', __name__, url_prefix='/ocr-workspace')

UPLOAD_FOLDER = 'uploads'

@ocr_workspace_bp.route('/test-ocr', methods=['POST'])
def test_ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    result = run_ocr(file_path)

    return jsonify({
        'file_name': file.filename,
        'result': result
    })