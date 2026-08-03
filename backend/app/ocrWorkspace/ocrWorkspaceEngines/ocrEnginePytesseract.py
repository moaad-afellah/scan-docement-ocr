import os
import pytesseract
from PIL import Image, UnidentifiedImageError

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def run_ocr_pytesseract(file_path, lang="eng"):
    """Runs OCR using pytesseract."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"OCR input file was not found: {file_path}")

    try:
        with Image.open(file_path) as img:
            img.load()
            raw_text = pytesseract.image_to_string(img, lang=lang)
    except UnidentifiedImageError as exc:
        raise ValueError(f"The uploaded file is not a valid image: {os.path.basename(file_path)}") from exc
    except OSError as exc:
        raise ValueError(f"The uploaded image could not be read: {os.path.basename(file_path)}") from exc

    return raw_text