# Document Summary Assistant

A focused take-home MVP that extracts text from PDFs and images, then generates three levels of summary, key points, and improvement suggestions with Google Gemini.

## Architecture

The React frontend sends one multipart upload to FastAPI. The backend validates the file, extracts PDF text with PyMuPDF or image text with Pillow/Tesseract, and sends bounded source text to Gemini. There is no database, authentication, or persistent document storage.

## Setup

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn server:app --reload --port 8001
```

Tesseract must also be installed on the host (for example, `brew install tesseract` on macOS or `apt-get install tesseract-ocr` on Debian).

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env
yarn start
```

## Environment variables

Backend: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `GEMINI_API_KEY`, and optional `GEMINI_MODEL`.
Frontend: `REACT_APP_BACKEND_URL`.

## Deployment

Build the frontend with `yarn build` and host the generated build directory on Vercel. Run FastAPI with `uvicorn server:app --host 0.0.0.0 --port 8001` on a Python host. Set the same environment variables there.

## Assumptions and future improvements

Uploads are processed in memory and are not stored. Very large extracted text is bounded to 120,000 characters with a notice. A future version could use bounded chunk summarization, streaming progress, multilingual OCR, and automated tests for extraction edge cases.