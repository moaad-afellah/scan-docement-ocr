from app.ocrWorkspace.ocrWorkspaceEngines.ocrEnginePytesseract import run_ocr_pytesseract
from app.ocrWorkspace.ocrWorkspaceEngines.ocrEngineEasyocr import run_ocr_easyocr
from app.ocrWorkspace.ocrWorkspaceEngines.ocrEngineMicroservice import run_ocr_microservice
from app.ocrWorkspace.ocrWorkspaceEngines.ocrFieldExtractor import extract_fields


def run_ocr(file_path, engine="pytesseract", lang="eng", field_labels=None):
    """Dispatches to the selected OCR engine and extracts fields dynamically."""

    if field_labels is None:
        field_labels = []

    if engine == "pytesseract":
        raw_text = run_ocr_pytesseract(file_path, lang=lang)
    elif engine == "easyocr":
        raw_text = run_ocr_easyocr(file_path)
    elif engine == "tesseract-js":
        raw_text = run_ocr_microservice(file_path)
    else:
        raise ValueError(f"Unsupported OCR engine: {engine}")

    extracted_data = extract_fields(raw_text, field_labels)

    return {
        "engine": engine,
        "raw_text": raw_text,
        "fields": extracted_data
    }