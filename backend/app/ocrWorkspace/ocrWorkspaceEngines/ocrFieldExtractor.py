import re


def extract_fields(raw_text, field_labels):
    """
    Extracts values from OCR text dynamically, based on whatever
    field labels are defined for the document type.

    field_labels: list of strings, e.g. ["First Name", "Last Name", "Card Number"]
    Returns: dict keyed by normalized label (lowercase, spaces -> underscores)
    """
    result = {}

    for label in field_labels:
        # Capture everything after the label until the end of the line
        pattern = rf"{re.escape(label)}\s+(.+)"
        match = re.search(pattern, raw_text, re.IGNORECASE)

        key = label.lower().replace(" ", "_")
        result[key] = match.group(1).strip() if match else None

    return result