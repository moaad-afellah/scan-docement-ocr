from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrEnginePytesseract import run_ocr_pytesseract
from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrEngineEasyocr import run_ocr_easyocr
from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrEngineMicroservice import run_ocr_microservice
from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrFieldExtractor import extract_fields

SUPPORTED_ENGINE_CODES = ("pytesseract", "easyocr", "tesseract-js")
DEFAULT_ENGINE_FALLBACK = "easyocr"


def get_supported_engine_codes():
    return SUPPORTED_ENGINE_CODES


def is_supported_engine(engine):
    return engine in SUPPORTED_ENGINE_CODES


def _get_engine_for_runtime(engine):
    if engine == "pytesseract":
        try:
            from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrEnginePytesseract import run_ocr_pytesseract
            run_ocr_pytesseract(file_path="", lang="eng")
        except Exception:
            return DEFAULT_ENGINE_FALLBACK
    return engine


def run_ocr(file_path, engine="pytesseract", lang="eng", field_labels=None):
    """Dispatches to the selected OCR engine and extracts fields dynamically."""

    if field_labels is None:
        field_labels = []

    if not is_supported_engine(engine):
        supported = ", ".join(get_supported_engine_codes())
        raise ValueError(f"Unsupported OCR engine: {engine}. Supported engines: {supported}")

    resolved_engine = engine
    if engine == "pytesseract":
        try:
            from backend.app.ocrWorkspace.ocrWorkspaceEngines.ocrEnginePytesseract import run_ocr_pytesseract
            run_ocr_pytesseract(file_path="", lang=lang)
        except Exception:
            resolved_engine = DEFAULT_ENGINE_FALLBACK

    try:
        if resolved_engine == "pytesseract":
            raw_text = run_ocr_pytesseract(file_path, lang=lang)
        elif resolved_engine == "easyocr":
            raw_text = run_ocr_easyocr(file_path)
        elif resolved_engine == "tesseract-js":
            raw_text = run_ocr_microservice(file_path)
    except Exception as exc:
        raise RuntimeError(f"OCR engine failed: {exc}") from exc

    extracted_data = extract_fields(raw_text, field_labels)

    return {
        "engine": resolved_engine,
        "raw_text": raw_text,
        "fields": extracted_data
    }