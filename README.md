# Concise.ai - Document Summary Assistant

An AI-powered document summarization application that extracts text from PDFs and images, generates concise summaries, identifies key points, and suggests improvements using Google's Gemini models.

Deployed app: https://vercel.com/pradnyabackup8-gmailcoms-projects/document-summarizer

## Features

* Upload PDF documents
* Upload image files (PNG, JPG, JPEG)
* Automatic text extraction from PDFs
* OCR support for scanned images
* AI-generated summaries at multiple levels:

  * Short Summary
  * Medium Summary
  * Detailed Summary
* Key Point Extraction
* Improvement Suggestions
* File size validation
* Structured JSON responses
* Responsive React frontend
* FastAPI backend

---

## Architecture

```text
┌─────────────┐
│ React Frontend │
└──────┬──────┘
       │
       │ File Upload
       ▼
┌─────────────┐
│ FastAPI API │
└──────┬──────┘
       │
       ├── PDF → PyMuPDF
       │
       ├── Image → Tesseract OCR
       │
       ▼
┌─────────────┐
│ Extract Text │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Gemini 3.6 Flash │
└──────┬───────────┘
       │
       ▼
┌─────────────────┐
│ Structured JSON │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ React UI Result │
└─────────────────┘
```

---

## Tech Stack

### Frontend

* React
* TypeScript
* Axios
* Lucide React
* CSS

### Backend

* FastAPI
* Pydantic
* Google GenAI SDK
* PyMuPDF
* Tesseract OCR
* Pillow

### AI

* Gemini 3.6 Flash

### Deployment

* Frontend: Vercel
* Backend: Render

---

## API Endpoint

### Upload Document

```http
POST /api/upload
```

#### Request

Multipart form data:

```text
file=<pdf|png|jpg>
```

#### Response

```json
{
  "filename": "sample.pdf",
  "document_type": "pdf",
  "summary": {
    "short": "...",
    "medium": "...",
    "long": "..."
  },
  "key_points": [
    "...",
    "..."
  ],
  "improvements": [
    "...",
    "..."
  ],
  "processing_notice": null
}
```

---

## Environment Variables

### Backend

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3.6-flash

CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-vercel-app.vercel.app
```

### Frontend

```env
REACT_APP_BACKEND_URL=https://your-render-app.onrender.com
```

---

## Local Setup

### Clone Repository

```bash
git clone <repository-url>
cd document-summary-assistant
```

---

### Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run server:

```bash
uvicorn server:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Supported Files

| Type | Supported |
| ---- | --------- |
| PDF  | ✅         |
| PNG  | ✅         |
| JPG  | ✅         |
| JPEG | ✅         |
| DOCX | ❌         |

Maximum file size:

```text
10 MB
```

---

## Validation Rules

* Supported file types only
* Maximum file size: 10 MB
* Minimum readable text required
* Structured Gemini response validation
* Automatic truncation of documents exceeding 120,000 characters

---

## Error Handling

The application handles:

* Invalid file types
* Empty files
* Oversized files
* PDF extraction failures
* OCR failures
* Gemini API failures
* Invalid model responses
* Network failures
* CORS configuration issues

---

## Deployment

### Frontend (Vercel)

```bash
npm run build
```

Deploy using:

```bash
vercel
```

### Backend (Render)

Start Command:

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

Build Command:

```bash
pip install -r requirements.txt
```

---

## Future Improvements

* DOCX support
* Chunked processing for large documents
* Summary export
* User authentication
* Summary history
* Multiple summary styles
* Streaming responses
* Batch document processing

---

## Challenges Solved

* PDF text extraction
* OCR integration
* Structured JSON generation with Gemini
* Response validation using Pydantic
* Cross-origin communication between Vercel and Render
* File upload handling
* Production deployment and environment management

---

## License

MIT License

---

For a university submission or portfolio, I'd also add a **"Key Engineering Decisions"** section explaining why you chose FastAPI, Gemini, PyMuPDF, and structured JSON validation. That tends to impress reviewers more than just listing features.
