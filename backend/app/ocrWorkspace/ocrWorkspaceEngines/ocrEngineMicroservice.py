import requests


def run_ocr_microservice(file_path, service_url="http://localhost:5001/ocr"):
    """Runs OCR by calling the Node.js Tesseract.js microservice."""
    try:
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(service_url, files=files, timeout=30)

        response.raise_for_status()
        data = response.json()
        return data["raw_text"]

    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            "OCR microservice is unreachable. Make sure 'node server.js' is running on port 5001."
        )