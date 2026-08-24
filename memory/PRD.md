# Document Summary Assistant PRD

## Original problem statement
Build a simple, production-quality take-home Document Summary Assistant that accepts PDF and image documents, extracts text, generates short/medium/long Gemini summaries, key points, improvement suggestions, and provides a polished responsive experience without auth, databases, or unnecessary infrastructure.

## Architecture decisions
- React + TypeScript single-page frontend with explicit upload, preview, processing, results, and reset states.
- FastAPI backend with one multipart upload route and a health route.
- PyMuPDF for PDFs; Pillow + Tesseract for images; Google Gemini via GEMINI_API_KEY in backend environment.
- In-memory processing only; bounded extracted text at 120,000 characters with a notice.

## User personas
- Interview reviewer evaluating code quality, robustness, and UX.
- Knowledge worker who needs a fast first read of a dense document.

## Core requirements
- PDF/image upload, drag-and-drop, 10 MB validation, previews, OCR/PDF extraction, one Gemini request for three summaries, key points, improvements, loading/error states, tabs, copy, download, mobile responsiveness, README, and approach write-up.

## Implemented (2026-08-24)
- Replaced starter shell with a professional document workspace.
- Added live Gemini-backed FastAPI processing, structured validation, useful errors, and text bounding.
- Added responsive preview and results UX with summary tabs, copy/download, reset, and test IDs.
- Added README, APPROACH.md, environment examples, lint/build checks, and regression coverage.

## Prioritized backlog
- P0: none.
- P1: optional chunk-level summarization for very long documents; multilingual OCR controls.
- P2: persistent history, async jobs/progress streaming, automated extraction fixtures.

## Next tasks
1. Consider chunk-level summarization while preserving source ordering.
2. Add multilingual OCR language selection.
3. Add a small automated unit suite for PDF/OCR edge cases.
