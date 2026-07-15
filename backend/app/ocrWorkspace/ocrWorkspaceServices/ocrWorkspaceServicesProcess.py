import re
import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_fields(raw_text):
    """Extracts information from the OCR text."""

    result = {}

    last = re.search(r"Last Name\s+([A-Z]+)", raw_text)  # Use search to find and extract the matching value, regardless of its position in the text
    first = re.search(r"First Name\s+([A-Z]+)", raw_text)
    birth = re.search(
        r"Date of Birth\s+(\d{2}\.\d{2}\.\d{4})\s+in\s+([A-Z]+)",
        raw_text
    )
    valid = re.search(
        r"Valid Until\s+(\d{2}\.\d{2}\.\d{4})",
        raw_text
    )
    card = re.search(
        r"Card Number\s+([A-Z0-9]+)",
        raw_text
    )

    result["last_name"] = last.group(1) if last else None
    result["first_name"] = first.group(1) if first else None
    result["date_of_birth"] = birth.group(1) if birth else None
    result["place_of_birth"] = birth.group(2) if birth else None
    result["valid_until"] = valid.group(1) if valid else None
    result["card_number"] = card.group(1) if card else None

    return result


def run_ocr(file_path, lang="eng"):
    """Reads the image, performs OCR, and returns extracted fields."""

    img = Image.open(file_path)
    raw_text = pytesseract.image_to_string(img, lang=lang)

    extracted_data = extract_fields(raw_text)

    return {
        "raw_text": raw_text,
        "fields": extracted_data
    }