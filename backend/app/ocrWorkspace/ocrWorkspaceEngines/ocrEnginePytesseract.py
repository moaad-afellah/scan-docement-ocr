import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def run_ocr_pytesseract(file_path, lang="eng"):
    """Runs OCR using pytesseract."""
    img = Image.open(file_path)
    raw_text = pytesseract.image_to_string(img, lang=lang)
    return raw_text