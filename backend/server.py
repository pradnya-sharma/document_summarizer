"""Document Summary Assistant API."""
import io
import json
import logging
import os
from pathlib import Path
from typing import Any

import fitz
import pytesseract
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field, field_validator

load_dotenv(Path(__file__).parent / ".env")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_TEXT_CHARS = 120_000
SUPPORTED_TYPES = {"application/pdf", "image/png", "image/jpeg"}


class SummaryPayload(BaseModel):
    short: str = Field(min_length=1)
    medium: str = Field(min_length=1)
    long: str = Field(min_length=1)


class GeneratedPayload(BaseModel):
    summary: SummaryPayload
    key_points: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)

    @field_validator("key_points", "improvements")
    @classmethod
    def clean_items(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip() for item in values if item and item.strip()]
        if not cleaned:
            raise ValueError("At least one item is required")
        return cleaned


class SummaryResponse(BaseModel):
    filename: str
    document_type: str
    summary: SummaryPayload
    key_points: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)
    processing_notice: str | None = None

    @field_validator("key_points", "improvements")
    @classmethod
    def clean_items(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip() for item in values if item and item.strip()]
        if not cleaned:
            raise ValueError("At least one item is required")
        return cleaned


def extract_pdf_text(data: bytes) -> str:
    try:
        with fitz.open(stream=data, filetype="pdf") as document:
            return "\n\n".join(page.get_text("text") for page in document).strip()
    except Exception as exc:
        logger.exception("PDF extraction failed")
        raise HTTPException(422, "We couldn’t read this PDF. Please try another file.") from exc


def extract_image_text(data: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(data))
        return pytesseract.image_to_string(image).strip()
    except Exception as exc:
        logger.exception("OCR failed")
        raise HTTPException(422, "We couldn’t read text from this image. Please try a clearer scan.") from exc


def normalize_gemini_json(raw: str) -> dict[str, Any]:
    cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        parsed = json.loads(cleaned)
        return GeneratedPayload.model_validate(parsed).model_dump()
    except (json.JSONDecodeError, ValueError, TypeError) as exc:
        raise HTTPException(502, "The summary service returned an unexpected response. Please try again.") from exc


def generate_summary(text: str) -> dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(503, "Summary generation is not configured yet. Add GEMINI_API_KEY to the backend environment.")
    prompt = f"""You summarize source documents accurately and conservatively.
Return ONLY valid JSON with this exact shape:
{{"summary":{{"short":"...","medium":"...","long":"..."}},"key_points":["..."],"improvements":["..."]}}
Short is 2-3 sentences, medium is 1-2 paragraphs, long is 3-5 paragraphs.
Key points should contain 4-7 concise factual bullets. Improvement suggestions should contain 3-5 useful suggestions for clarity, structure, missing context, or next steps. Do not invent facts.

SOURCE DOCUMENT:
{text}"""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        raw = response.text or ""
        payload = normalize_gemini_json(raw)
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Gemini generation failed")
        raise HTTPException(502, "Gemini couldn’t generate a summary. Please try again shortly.") from exc


app = FastAPI(title="Document Summary Assistant")
api = APIRouter(prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@api.get("/health")
async def api_health() -> dict[str, str]:
    return {"status": "ok"}


@api.post("/upload", response_model=SummaryResponse)
async def upload_document(file: UploadFile = File(...)) -> SummaryResponse:
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(415, "Unsupported file type. Upload a PDF, PNG, or JPG image.")
    data = await file.read()
    if not data:
        raise HTTPException(400, "This file is empty. Choose a document with content.")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(413, "This file is larger than 10 MB. Choose a smaller document.")

    document_type = "pdf" if file.content_type == "application/pdf" else "image"
    text = extract_pdf_text(data) if document_type == "pdf" else extract_image_text(data)
    if len(text.strip()) < 30:
        raise HTTPException(422, "We couldn’t find enough readable text in this document.")

    notice = None
    if len(text) > MAX_TEXT_CHARS:
        text = text[:MAX_TEXT_CHARS]
        notice = "This document was longer than the processing limit, so only its first 120,000 characters were summarized."
    result = generate_summary(text)
    return SummaryResponse(
        filename=file.filename or "document",
        document_type=document_type,
        summary=result["summary"],
        key_points=result["key_points"],
        improvements=result["improvements"],
        processing_notice=notice,
    )


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)