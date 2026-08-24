import io
import os

import fitz
import pytest
import requests


BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


def pdf_bytes(text="This is a sufficiently long engineering document for summary testing."):
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    data = document.tobytes()
    document.close()
    return data


def test_api_health():
    response = requests.get(f"{BASE_URL}/api/health", timeout=20)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_rejects_unsupported_type():
    response = requests.post(
        f"{BASE_URL}/api/upload",
        files={"file": ("notes.txt", b"plain text", "text/plain")},
        timeout=20,
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]


def test_upload_rejects_empty_file():
    response = requests.post(
        f"{BASE_URL}/api/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        timeout=20,
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_rejects_oversized_file():
    response = requests.post(
        f"{BASE_URL}/api/upload",
        files={"file": ("large.pdf", b"x" * (10 * 1024 * 1024 + 1), "application/pdf")},
        timeout=30,
    )
    assert response.status_code == 413
    assert "10 MB" in response.json()["detail"]


@pytest.mark.timeout(90)
def test_upload_returns_valid_summary_shape():
    response = requests.post(
        f"{BASE_URL}/api/upload",
        files={"file": ("TEST_summary.pdf", io.BytesIO(pdf_bytes()), "application/pdf")},
        timeout=90,
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["filename"] == "TEST_summary.pdf"
    assert set(payload["summary"]) == {"short", "medium", "long"}
    assert payload["key_points"] and payload["improvements"]