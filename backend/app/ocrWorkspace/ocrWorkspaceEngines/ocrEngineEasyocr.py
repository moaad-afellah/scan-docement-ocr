import easyocr

# Initialized once at module load (expensive to reload per request)
easyocr_reader = easyocr.Reader(['en'])


def run_ocr_easyocr(file_path):
    """Runs OCR using EasyOCR."""
    results = easyocr_reader.readtext(file_path, detail=0)
    raw_text = "\n".join(results)
    return raw_text