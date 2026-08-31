
## 1. Executive Summary

This project is a lightweight document summarization application built to turn uploaded PDFs and images into concise AI-generated summaries, key points, and improvement suggestions. The codebase is a small but complete full-stack app: a React frontend for upload and review, and a FastAPI backend for validation, text extraction, and Gemini-based summarization.

The primary purpose is to help users quickly understand long documents without reading every page. The intended users are knowledge workers, students, and professionals dealing with dense documents such as reports, technical specs, research PDFs, or scanned materials.

Major capabilities:
- Upload PDFs and image files
- Extract text from PDFs using PyMuPDF
- OCR text from PNG/JPG images using Tesseract
- Validate file type and size
- Truncate extremely long documents before LLM processing
- Generate three summary levels: short, medium, and long
- Extract key points and improvement suggestions
- Return structured JSON to the frontend
- Display summaries in a browser and allow copy/download actions

Evidence for the key behavior is centered in `server.py`, `App.tsx`, and `README.md`.

---

## 2. Repository Overview

### Repository tree

```text
document_summarizer/
├── APPROACH.md
├── README.md
├── .gitignore
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── server.py
│   └── tests/
│       └── test_document_summary.py
├── frontend/
│   ├── components.json
│   ├── craco.config.js
│   ├── jsconfig.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── plugins/
│   │   └── health-check/
│   │       ├── health-endpoints.js
│   │       └── webpack-health-plugin.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.css
│       ├── App.tsx
│       ├── index.css
│       ├── index.js
│       ├── components/
│       │   └── ui/
│       │       ├── ...
│       │       └── many generated shadcn-style components
│       ├── constants/
│       │   └── testIds/
│       │       ├── auth.js
│       │       ├── home.js
│       │       └── index.js
│       ├── hooks/
│       │   └── use-toast.js
│       ├── lib/
│       │   └── utils.js
│       └── types.ts
└── .git/
```

### Top-level directory explanations

- `backend`
  - Contains the FastAPI application, environment config, dependencies, and tests.
  - This is the processing engine and API surface.

- `frontend`
  - Contains the React single-page application and supporting build tooling.
  - Provides the upload UI, preview, and result rendering.

- `APPROACH.md`
  - Explains the project’s intended processing pipeline in narrative form.

- `README.md`
  - The primary user-facing project documentation, including setup and deployment expectations.

- `.gitignore`
  - Covers common generated files, secrets, environment files, and build output.

### Important root files

- `APPROACH.md`: describes the processing pipeline—upload, extract, summarize, validate, return.
- `README.md`: user-facing overview with deployment and setup notes.
- `.gitignore`: ignores env and build directories, but note the repo still contains a checked-in backend `.env`, which is a security risk.
- `backend`: functional backend and tests.
- `frontend`: functional frontend and dev tooling.

---

## 3. Technology Stack

### FastAPI
- What it is: Python web framework for APIs.
- Why used: simple, modern async HTTP API with data validation and generated docs.
- Where used: `server.py` defines routes, middleware, validation, and Pydantic schemas.
- Key dependencies: `fastapi`, `uvicorn`, `python-multipart`, `pydantic`.
- Role: hosts the upload endpoint, validation layer, and summary generation flow.

### React + TypeScript
- What it is: UI library and typed JavaScript superset.
- Why used: quick front-end development for a single upload-and-results experience.
- Where used: `App.tsx`, `index.js`, `types.ts`.
- Key dependencies: `react`, `react-dom`, `@types/react`, `@types/react-dom`.
- Role: renders upload controls, previews, and result tabs.

### Axios
- What it is: HTTP client.
- Why used: easy multipart upload from browser to backend.
- Where used: `App.tsx`.
- Role: sends `multipart/form-data` to `/api/upload`.

### Google GenAI SDK
- What it is: Google AI client library.
- Why used: to call Gemini models for summary generation.
- Where used: `server.py`.
- Key dependency: `google-genai`.
- Role: sends a prompt and receives structured JSON summaries.

### PyMuPDF (`fitz`)
- What it is: PDF extraction library.
- Why used: parse text from PDF files efficiently.
- Where used: `server.py`.
- Role: `extract_pdf_text()` reads text from each PDF page.

### Tesseract OCR
- What it is: OCR engine for image-based text extraction.
- Why used: support scanned docs and image uploads.
- Where used: `server.py`.
- Key dependency: `pytesseract`, `Pillow`.
- Role: turns uploaded images into text before summarization.

### Pydantic
- What it is: schema validation and parsing library.
- Why used: ensure generated summary JSON matches expected structure.
- Where used: `server.py`.
- Role: `SummaryPayload`, `GeneratedPayload`, and `SummaryResponse` validate fields.

### CRACO + Tailwind
- What it is: CRA customization and utility CSS framework.
- Why used: styling the bespoke design system without ejecting CRA.
- Where used: `craco.config.js`, `tailwind.config.js`, `index.css`.
- Role: dev/build config and theme tokens.

### Radix UI + shadcn-style primitives
- What it is: accessible component primitives.
- Why used: reusable UI elements and pattern consistency.
- Where used: `ui`, `components.json`.
- Role: generated base components, though the app itself mainly uses direct custom JSX instead of invoking those components heavily.

### Testing toolchain
- What it is: `pytest` with `requests` for backend API tests.
- Why used: verify API behavior for invalid input and valid summary responses.
- Where used: `test_document_summary.py`, `pytest.ini`.
- Role: validates health and upload routes.

### Additional dev tooling
- `dotenv`: env loading from backend `.env`
- `lucide-react`: icons in UI
- `@tanstack/react-query`: present in `index.js`, but not used by the current app logic
- `react-router-dom`: dependency exists, but the app is a single-page component without routing

---

## 4. System Architecture

### Frontend architecture
The frontend is a single-page React app with one primary screen in `App.tsx`. It manages:
- selected file
- generated preview
- loading stage
- current result
- active summary tab
- error state

The UI has two main columns:
- upload/selection area
- results area

It performs:
- local validation for file type/size
- preview generation using object URLs
- multipart upload to backend
- rendering summary tabs and key points

### Backend architecture
The backend is a single FastAPI service in `server.py`. It is stateless and contains:
- route registration
- file validation
- text extraction functions
- Gemini prompt builder
- JSON normalization and validation
- CORS middleware

Its workflow:
1. Accept `UploadFile`
2. Validate content type and size
3. Extract text
4. Check minimum readable text
5. Truncate if too long
6. Invoke Gemini
7. Validate returned JSON
8. Return summary payload

### Database architecture
There is no real database implementation in the repository.

Important evidence:
- No `pymongo`, `sqlalchemy`, `postgres`, or `sqlite` dependency appears in `requirements.txt`
- No schema, migration, or data model layer is present
- `.env.example` and `.env` contain `MONGO_URL` and `DB_NAME`, but they are not used anywhere in code

This means the current system is effectively stateless and does not persist documents, summaries, or user data. It is an upload-once processing service.

### External services / APIs
1. Google Gemini API
   - Used for LLM-powered summarization
   - Configured through `google-genai`

2. Tesseract OCR
   - Used for image text extraction

3. PDF extraction library
   - Used for PDF text extraction

4. Browser fonts
   - Google Fonts loaded in `index.html`

### Authentication / authorization
There is no authentication or authorization layer in the app.

- No token generation
- No session management
- No middleware for auth
- No user accounts
- No role-based access

This is an unauthenticated API. The app treats upload as anonymous and ephemeral.

### Data flow through the system
```text
Browser
  │
  ├─ selects file
  │
  ▼
React App
  │  file validation / preview
  │
  ├─ axios.post(form-data)
  │
  ▼
FastAPI /api/upload
  │  check MIME, size, empty
  │  extract text (PDF or OCR)
  │  truncate if needed
  │  generate prompt
  │
  ▼
Google Gemini
  │  structured JSON response
  │
  ▼
Pydantic validation
  │  normalize / validate fields
  │
  ▼
React UI
  │  renders summary tabs
  │  key points + suggestions
  │  copy/download actions
```

### Request lifecycle
For each upload:
1. File selected in browser
2. Client-side validation checks accepted types and size
3. `FormData` POST to backend
4. FastAPI checks content type
5. File content read from `UploadFile`
6. PDF or OCR extraction
7. Summary generation prompt constructed
8. Google model returns JSON
9. JSON normalized and validated
10. Response returned to UI
11. UI updates result state

---

## 5. Application Flow

### What happens when the application starts
The frontend boots in `index.js`:
- `ReactDOM.createRoot(...)`
- wraps app in `React.StrictMode`
- provides `QueryClientProvider`
- renders the app

The app then renders the single main screen from `App.tsx` with:
- upload zone
- empty state
- result region

There is no router or page-level navigation in this project.

### Main user journeys
1. User selects a PDF or image
2. App validates on client side
3. File preview appears
4. User clicks “Generate summary”
5. Loading stages progress: upload → extract → generate
6. Backend returns summary JSON
7. UI shows short/medium/long tabs
8. User copies or downloads the output

### End-to-end request flow
The user flow is implemented entirely in `submit()` within `App.tsx`. It:
- creates `FormData`
- appends file
- posts to `${process.env.REACT_APP_BACKEND_URL}/api/upload`
- handles success by setting `result`
- handles failure by setting `error`

### State management flow
The app uses local React state instead of global state management:
- `file`
- `preview`
- `result`
- `activeTab`
- `loadingStage`
- `error`

This is a simple, component-local approach. It is sufficient because the app is small and there are no user accounts or multi-page flows.

### Error handling flow
The frontend catches backend errors from `axios`:
- `err.response?.data?.detail`
- displays in error alert

The backend raises HTTP exceptions for:
- unsupported type: `415`
- empty file: `400`
- oversized file: `413`
- unreadable PDF/OCR failure: `422`
- no readable text: `422`
- Gemini failure / malformed JSON: `502`
- missing API key: `503`

---

## 6. Folder-by-Folder Analysis

### `backend`
Purpose: API runtime and test environment.
How it fits: this is the server side where uploads are validated and processed.
Important files:
- `server.py`: all endpoint and summary logic
- `requirements.txt`: backend dependencies
- `pytest.ini`: pytest configuration
- `.env.example`: example env for backend
- `.env`: actual local env with secrets

### `tests`
Purpose: API verification.
Important files:
- `test_document_summary.py`: tests for health and upload behaviors

### `frontend`
Purpose: web app and build config.
How it fits: user-facing layer.
Important files:
- `package.json`: frontend dependencies and scripts
- `craco.config.js`: custom CRA config
- `tailwind.config.js`: styling config
- `components.json`: shadcn-style alias config

### `src`
Purpose: React source code.
Important files:
- `App.tsx`: main UI and upload flow
- `index.js`: bootstraps app
- `types.ts`: summary response type
- `App.css`: custom styling
- `index.css`: Tailwind base and theme variables

### `ui`
Purpose: generated UI primitive library.
How it fits: design-system scaffolding; not heavily used by this app.
Important files:
- wrapper components like `button.jsx`, `card.jsx`, etc.
- These are shadcn- or radix-style UI building blocks.

### `testIds`
Purpose: test selectors.
Important files:
- `home.js`
- `index.js`
- `auth.js`

### `hooks`
Purpose: reusable hooks.
Important file:
- `use-toast.js`: toast management hook

### `lib`
Purpose: utility functions.
Important file:
- `utils.js`: `cn(...)` helper for Tailwind class merging

### `health-check`
Purpose: development-time health endpoints for the webpack dev server.
Important files:
- `webpack-health-plugin.js`
- `health-endpoints.js`

### `public`
Purpose: static HTML shell.
Important file:
- `index.html`: page root with Google Fonts

---

## 7. File-by-File Analysis

### `server.py`
Purpose: single-file API server.
Main functions:
- `extract_pdf_text(data: bytes) -> str`
- `extract_image_text(data: bytes) -> str`
- `normalize_gemini_json(raw: str) -> dict[str, Any]`
- `generate_summary(text: str) -> dict[str, Any]`
- `upload_document(file: UploadFile = File(...)) -> SummaryResponse`
- `health()` and `api_health()`

Inputs:
- uploaded file from HTTP multipart request
- env vars `GEMINI_API_KEY`, `GEMINI_MODEL`, `CORS_ORIGINS`

Outputs:
- structured JSON with summary, key points, improvement suggestions, filename, processing_notice

Dependencies:
- `fitz`, `pytesseract`, `Pillow`, `google.genai`, `fastapi`, `pydantic`

Interaction:
- frontend calls this endpoint through Axios
- it validates results before returning to UI

### `requirements.txt`
Purpose: backend dependency manifest.
Includes:
- FastAPI, uvicorn, python-multipart
- Google GenAI SDK
- PyMuPDF, Pillow, Tesseract
- pytest

### `pytest.ini`
Purpose: test configuration.
Key detail:
- uses `pytest-xdist` with `-n 2 --dist loadscope`
- indicates tests are designed around shared backend assumptions

### `test_document_summary.py`
Purpose: end-to-end API validation.
Main tests:
- health endpoint
- unsupported file type
- empty file
- oversized file
- successful summary shape
Notable detail:
- tests hit a live backend URL via `REACT_APP_BACKEND_URL`; they are not local unit tests.

### `.env.example`
Purpose: example environment template.
Contains:
- `MONGO_URL`
- `DB_NAME`
- `CORS_ORIGINS`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

### `.env`
Purpose: local environment with real runtime secrets.
Important issue:
- this file appears to contain a live Gemini API key and is committed in the working repo.
- this is a serious security concern.

### `package.json`
Purpose: app metadata, dependencies, and scripts.
Scripts:
- `start`: `craco start`
- `build`: `craco build`
- `test`: `craco test`

Key dependencies:
- React ecosystem
- shadcn/radix primitives
- Tailwind and CSS tools
- `axios`
- `@tanstack/react-query`

### `craco.config.js`
Purpose: custom CRA config.
Key behavior:
- alias `@` to `src`
- adds dev server compatibility
- conditionally enables webpack health checks
- configures watch ignore patterns
- registers custom health endpoints

### `tailwind.config.js`
Purpose: tailwind theme and plugin config.
Responsible for:
- custom color system
- border radius variables
- animations

### `jsconfig.json`
Purpose: TS path alias config.
Maps `@/*` to `src/*`.

### `index.html`
Purpose: HTML bootstrap shell for the app.
Includes:
- root div
- Google Fonts preconnects
- document title

### `index.js`
Purpose: app entry point.
Creates the React root and wraps app in:
- `React.StrictMode`
- `QueryClientProvider`

### `App.tsx`
Purpose: main application screen and orchestration logic.
Key state:
- `file`
- `preview`
- `result`
- `activeTab`
- `loadingStage`
- `error`

Key functions:
- `chooseFile`
- `submit`
- `reset`
- `copySummary`
- `download`
- `Insight`

This is the most important UI file.

### `types.ts`
Purpose: TypeScript contract for backend response.
Defines `SummaryResult` and expected shape.

### `App.css`
Purpose: bespoke styling for the single-page layout and components.
Contains:
- layout
- dropzone
- preview
- summary tabs
- result panels
- buttons

### `index.css`
Purpose: Tailwind entry plus CSS variables.
Defines theme colors and base styles.

### `utils.js`
Purpose: Tailwind class helper.
`cn()` merges conditional class names.

### `webpack-health-plugin.js`
Purpose: custom webpack plugin for compile health.
Tracks:
- compile state
- errors/warnings
- compile duration
- health readiness

### `health-endpoints.js`
Purpose: exposes dev server health endpoints:
- `/health`
- `/health/simple`
- `/health/ready`
- `/health/live`
- `/health/errors`
- `/health/stats`

### `README.md`
Purpose: public-facing overview and setup instructions.
Provides:
- feature list
- architecture diagram
- environment variables
- local setup commands
- supported file types and validation expectations

### `APPROACH.md`
Purpose: product/engineering narrative.
Explains the intended processing pipeline and why the project exists.

---

## 8. Entry Points

### Application entry points
Frontend:
- `index.js`

Backend:
- `server.py`

### Startup sequence
Frontend:
1. `index.js` creates React root
2. `QueryClientProvider` initializes React Query
3. `App` renders
4. user interacts with upload form

Backend:
1. `load_dotenv(...)` loads env
2. `logging.basicConfig(...)` configures logging
3. app creates `FastAPI(title="Document Summary Assistant")`
4. router `/api` is included
5. CORS middleware attached
6. health and upload routes registered

### Bootstrapping logic
- Backend bootstrapping is in `server.py` at module import time
- Frontend bootstrapping is in `index.js` at script execution

### Routing setup
The app has no client-side router. The user stays in a single page. The backend router is defined as:
- root health: `/health`
- API health: `/api/health`
- upload: `/api/upload`

### Initialization logic
- FastAPI app initializes with CORS and route registration
- React app initializes local state and query client
- no DB initialization, no auth bootstrap, no service container

---

## 9. Data Models

There are a few schema models in `server.py`:

### `SummaryPayload`
```python
class SummaryPayload(BaseModel):
    short: str = Field(min_length=1)
    medium: str = Field(min_length=1)
    long: str = Field(min_length=1)
```
Purpose:
- holds the three summary lengths

### `GeneratedPayload`
```python
class GeneratedPayload(BaseModel):
    summary: SummaryPayload
    key_points: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)
```
Validation:
- `clean_items()` strips blank values and enforces at least one item
- ensures generated content is not empty

### `SummaryResponse`
```python
class SummaryResponse(BaseModel):
    filename: str
    document_type: str
    summary: SummaryPayload
    key_points: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)
    processing_notice: str | None = None
```
This is the final API response contract returned to the frontend.

### Frontend model
In `types.ts`:
```ts
export type SummaryResult = {
  filename: string;
  document_type: "pdf" | "image";
  summary: { short: string; medium: string; long: string };
  key_points: string[];
  improvements: string[];
  processing_notice?: string | null;
};
```
This mirrors the backend schema.

### Relationships
There is no relational model or database structure. The data lifecycle is:
`Upload -> extracted text -> Gemini prompt -> JSON -> validated response -> React state -> UI`

### Validation logic
- file type is validated against `SUPPORTED_TYPES`
- file size is checked against `MAX_FILE_SIZE`
- extracted text must be at least 30 characters
- generated JSON is normalized and validated after Gemini output
- item lists are cleaned to remove blanks

---

## 10. API Documentation

### 1) GET `/health`
Method: `GET`
Purpose: basic health check
Response:
```json
{"status":"ok"}
```

### 2) GET `/api/health`
Method: `GET`
Purpose: API health check under router prefix
Response:
```json
{"status":"ok"}
```

### 3) POST `/api/upload`
Method: `POST`
Request:
- `multipart/form-data`
- field name: `file`
- accepted MIME types: `application/pdf`, `image/png`, `image/jpeg`
- max size: 10 MB

Example request:
```http
POST /api/upload
Content-Type: multipart/form-data
```

Request body example:
```text
file=@report.pdf
```

Response format:
```json
{
  "filename": "report.pdf",
  "document_type": "pdf",
  "summary": {
    "short": "...",
    "medium": "...",
    "long": "..."
  },
  "key_points": ["..."],
  "improvements": ["..."],
  "processing_notice": null
}
```

Validation:
- file type must be supported
- file must not be empty
- file must be <= 10 MB
- extracted text must be readable
- summary JSON must match `GeneratedPayload`

Business logic:
- extract text
- truncate to 120,000 characters if needed
- send prompt to Gemini
- validate and return response

Error responses:
- `415 Unsupported file type`
- `400 Empty file`
- `413 File too large`
- `422 Cannot read document`
- `502 Gemini returned invalid content`
- `503 GEMINI_API_KEY missing`

The app does not use OpenAPI generation from FastAPI docs explicitly, but FastAPI will create open API metadata automatically from the typed route definitions.

---

## 11. Frontend Deep Dive

### Component hierarchy
The app is effectively:
- root `App`
  - header
  - intro text
  - upload panel
  - results panel
  - footer
  - nested `Insight` component

The result is a single-screen layout in `App.tsx` rather than a routed application.

### State management
Local state only:
- `useState` for upload, preview, summary, tabs, loading, and error
- no Redux, context, or custom store
- no persisted session history

### Routing
No application routing exists. React Router is present in dependencies but unused in the current implementation. This is a single-page, one-screen experience.

### UI architecture
- custom CSS in `App.css`
- Tailwind theme variables in `index.css`
- design is a handcrafted “editor-like” document summary UI
- result region uses tabs for `short`, `medium`, `long`

### Data fetching
The app uses `axios.post` for upload:
```ts
const response = await axios.post<SummaryResult>(
  `${API}/upload`,
  form,
  { headers: { "Content-Type": "multipart/form-data" } }
);
```
No other network calls or APIs are used.

### Forms
There is a file input and drag/drop area. The file selection is treated as one form-like state. No full form library is used here.

### Reusable components
- `Insight` is a small reusable result panel component
- no broader component library is used in the main app
- most UI primitives exist in `ui`, but they are not extensively wired into this screen

### Styling strategy
- CSS variables and handcrafted classes dominate `App.css`
- Tailwind is configured but not aggressively used in the main app
- the app uses shadcn-style tokens and structure, but with custom CSS layering

---

## 12. Backend Deep Dive

### Services
The backend is mostly a single monolithic service rather than layered services. The relevant logic is all in one module:
- extraction logic
- validation logic
- AI prompt logic
- response shaping

There are no separate service classes or controller modules.

### Controllers
The route handlers in `server.py` function as the controller layer:
- `/health`
- `/api/health`
- `/api/upload`

### Middleware
CORS is configured:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This allows browser API calls from frontend origins.

### Business logic
- file validation
- document type handling
- OCR/PDF extraction
- minimum text detection
- summary generation
- response normalization

### Database access layer
None. There is no DB access in the codebase.

### Caching
None.

### Queue systems
None.

### Background jobs
None.

---

## 13. Database Analysis

There is no active database in this project.

### Current state
- no migration files
- no schema files
- no ORM
- no data persistence layer

### Observed config
The only database-related variables are in `.env.example` and `.env`:
- `MONGO_URL`
- `DB_NAME`

These values do not influence runtime behavior in the backend because no Mongo connection code exists.

### Assessment
This project is intentionally stateless and ephemeral. It processes documents in memory and responds immediately, which fits the “single request processing” use case.

---

## 14. Configuration & Environment

### Environment variables table

| Variable | Source | Required | Purpose | Notes |
|---|---|---:|---|---|
| `GEMINI_API_KEY` | `.env.example`, `.env` | Yes | API key for Gemini model | essential for summary generation |
| `GEMINI_MODEL` | `.env.example`, `.env` | Yes | Model name | defaults to `gemini-3.6-flash` |
| `CORS_ORIGINS` | `.env.example`, `.env` | Optional | allowed frontend origins | split by comma |
| `MONGO_URL` | `.env.example`, `.env` | No | stale placeholder | not used in runtime |
| `DB_NAME` | `.env.example`, `.env` | No | stale placeholder | not used in runtime |
| `REACT_APP_BACKEND_URL` | `README.md`, frontend runtime assumption | Yes for frontend | backend base URL | not actually defined in repo config |

### Configuration files
- `.env`: local secrets
- `.env.example`: example env
- `package.json`: app config
- `craco.config.js`: dev-server config
- `tailwind.config.js`: CSS config
- `jsconfig.json`: TypeScript path alias

### Secrets required
- Google API key for Gemini
- local frontend backend URL
- CORS origins may need adjustment by deployment target

### Runtime configuration
- backend loads `.env` via `load_dotenv(Path(__file__).parent / ".env")`
- frontend reads runtime env at build time via `process.env.REACT_APP_BACKEND_URL`

### Build configuration
- CRA via `react-scripts` + CRACO
- build script defined in `package.json`
- no Docker or deployment YAML files are present

---

## 15. Authentication & Security

### Authentication flow
There is no authentication. The app is effectively public.

### Authorization flow
None. Any client can upload a file to the endpoint.

### Token handling
No tokens are issued or validated.

### Session management
None.

### Security measures
- `CORSMiddleware` restricts CORS
- file type checks
- file size limit
- minimum readable text check
- model output validation with Pydantic
- summary prompt intentionally instructs not to invent facts

### Potential risks
1. Secret leakage
   - a live Gemini key is present in `.env`
2. Public API
   - anyone can upload arbitrary files
3. No rate limiting
   - repeated uploads could drive API costs
4. Large content input
   - PDF/image text is truncated, but model prompts still contain potentially sensitive docs
5. No user identity or audit trail
   - no traceability to who uploaded a document

---

## 16. Third-Party Integrations

### Google Gemini
Purpose:
- generate summaries, key points, suggestions

Authentication:
- `GEMINI_API_KEY` in env

Data exchanged:
- extracted text as prompt
- structured JSON response

Where used:
- `server.py` `generate_summary()`

### Tesseract OCR
Purpose:
- OCR scanned images or screenshots

Authentication:
- none, local binary + Python library

Data exchanged:
- image bytes -> OCR text

Where used:
- `server.py` `extract_image_text()`

### PyMuPDF
Purpose:
- extract text from PDF pages

Authentication:
- none

Data exchanged:
- PDF bytes -> page text

Where used:
- `server.py` `extract_pdf_text()`

### Google Fonts
Purpose:
- typography for the UI

Authentication:
- none

Data exchanged:
- stylesheet request from browser

Where used:
- `index.html`

---

## 17. Build & Deployment

### Build process
Frontend:
- `npm install`
- `npm run build`
- CRACO bundles the app for production

Backend:
- Python virtualenv
- `pip install -r requirements.txt`
- run with Uvicorn

### CI/CD pipeline
No CI/CD files exist in the repository.

Evidence:
- no `.github/workflows` directory
- no deployment manifests
- no Docker files
- no infrastructure as code

### Docker setup
None found.

### Deployment architecture
README indicates intended deployment:
- Frontend: Vercel
- Backend: Render

This is stated in `README.md`, but no deployment config is checked into the repo.

### Hosting requirements
- frontend static React app
- backend Python API
- Gemini API access
- environment variables for backend and frontend

---

## 18. Testing Strategy

### Test structure
The backend test suite is in `test_document_summary.py`. It validates:
- health endpoint
- invalid MIME type
- empty file
- oversized file
- correct response structure

### Test types
- API-level integration tests using Python `requests`
- no unit tests for extracted functions
- no frontend test suite in repo

### Coverage areas
Covered:
- upload validation
- API liveness
- response shape

Not covered:
- OCR success/failure paths
- PDF extraction edge cases
- Gemini prompt failure conditions
- front-end behavior
- CORS or auth flows

### How tests are run
The project config in `pytest.ini` sets:
```ini
addopts = -n 2 --dist loadscope
```
This means the suite is designed to run with xdist across two workers and assumes a running backend. It does not spin up the FastAPI app in-process.

---

## 19. Important Design Decisions

### Architectural patterns
- simple client-server architecture
- stateless API service
- local component state for UI
- direct integration with external AI service

### Design patterns
- request/response validation with Pydantic
- simple single-file backend (lack of layering)
- file upload pipeline
- custom UI + CSS rather than component framework adoption

### Tradeoffs
- stateless app is simple but not scalable for multi-user persistence
- single-file backend reduces complexity but increases maintenance burden
- no DB means no history, no analytics, and limited production semantics
- using a single prompt and strict JSON validation improves reliability but restricts flexibility

### Notable implementation choices
- `normalize_gemini_json()` strips Markdown fences before JSON parsing
- `MAX_TEXT_CHARS` = 120,000 prevents runaway prompt size
- `SummaryPayload` and `GeneratedPayload` validate result structure
- file previews are browser object URLs, not server-side storage

---

## 20. Dependency Analysis

### Critical dependencies
- `fastapi`: API framework
- `google-genai`: LLM access
- `pymupdf`: PDF content extraction
- `pytesseract`: OCR
- `Pillow`: image processing
- `react`: front-end rendering
- `axios`: upload requests
- `tailwindcss`: styling system
- `@radix-ui/*`: reusable UI primitives

### Why needed
They map directly to the system’s required responsibilities:
- accept uploads
- process files
- summarize text
- render results

### Potential alternatives
- Use `Flask` instead of FastAPI
- Use `tesseract` directly without `pytesseract`
- Use `pdfplumber` or `pypdf` instead of PyMuPDF
- Use a different LLM API or prompt structure
- Replace custom CSS with a more component-first UI framework

### Dependency graph
```text
Frontend
  ├─ React
  ├─ Axios
  ├─ Tailwind
  └─ UI primitives
        └─ CSS + icons

Backend
  ├─ FastAPI
  ├─ Pydantic
  ├─ google-genai
  ├─ fitz
  ├─ pytesseract
  └─ Pillow
```

---

## 21. Potential Issues & Technical Debt

### Code smells / concerns
- The backend is monolithic and all logic lives in one module
- There is no separation between controllers, services, and data layer
- The frontend is single-screen and not modular beyond the main app
- `App.tsx` is doing too much: validation, rendering, network, copy/download logic

### Architectural concerns
- no database, persistence, history, or user identity
- no authentication or authorization
- no rate limiting or request throttling
- no async job support for large documents
- no retries/backoff for Gemini failures

### Scalability bottlenecks
- one request per upload in a stateless server
- every PDF/image is processed synchronously
- large prompts and model calls are blocking from an API perspective
- no queue or worker system for batch processing

### Security concerns
- live API key appears in committed file `.env`
- public file upload endpoint with no auth
- no request validation beyond type/size
- no content scanning beyond OCR and prompt limits

### Maintainability issues
- no structured service layer
- no tests for frontend behavior
- no docs around environment for frontend
- stale Mongo variables suggest incomplete or copied template configuration

---

## 22. How to Extend the Project

### How to add a new feature
1. Identify whether it belongs in frontend UI or backend processing
2. If it changes the API contract, update `server.py`
3. If it changes the frontend display, update `App.tsx` and relevant types
4. Add or update tests in `test_document_summary.py`

### How to add a new API
- add a new route in `server.py`
- define request/response models
- add validation and exception handling
- return typed JSON
- optionally add tests

Example pattern:
```python
@api.post("/my-new-endpoint")
async def my_endpoint(payload: MyRequest) -> MyResponse:
    ...
```

### How to add a new page/component
- add a new React component in `src`
- import it into `App.tsx` or a router if introduced
- manage state locally or via lifted state
- update type definitions in `types.ts`

### How to add a new integration
- add dependency in `requirements.txt`
- add client code in `server.py` or a new module
- inject config via environment variables
- add safe error handling and timeouts

### Recommended development workflow
1. Install backend dependencies
2. Add `.env` values for Gemini
3. Start backend with Uvicorn
4. Start frontend with `npm start`
5. test upload flow manually
6. run backend pytest checks
7. iterate on single-responsibility logic

---

## 23. New Developer Onboarding Guide

### Required tools
- Python 3.11+
- Node.js 18+
- npm or yarn
- Tesseract OCR binary installed locally
- access to a Gemini API key

### Setup instructions
Backend:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install
```

Environment:
- create or update `.env`
- set `GEMINI_API_KEY` and `GEMINI_MODEL`
- for frontend, set `REACT_APP_BACKEND_URL` when running locally

### Local development workflow
Backend:
```bash
cd backend
uvicorn server:app --reload
```

Frontend:
```bash
cd frontend
npm start
```

### Common commands
- Backend health:
  - `curl http://localhost:8000/health`
- Frontend build:
  - `npm run build`
- Backend tests:
  - `pytest`
- API upload check:
  - use `curl` with a multipart form upload

### Debugging tips
- Check backend logs in terminal while calling `/api/upload`
- Inspect `response.data.detail` in the browser network tab
- Confirm frontend is using the correct backend URL
- Verify Tesseract installation if image OCR fails
- Check that `GEMINI_API_KEY` is present in the Python environment

---

## 24. Glossary

- Document summary: condensed analysis of a document’s core meaning
- OCR: optical character recognition; converting image text into machine-readable text
- LLM: large language model; here, Gemini
- multipart upload: file transfer using form-data encoding
- processing_notice: backend warning when input is truncated
- `SummaryPayload`: the three summary lengths returned by the model
- `GeneratedPayload`: structured result before API serialization
- `UploadFile`: FastAPI representation of uploaded content
- `FormData`: browser mechanism for sending file data in HTTP requests

---

## 25. Architecture Summary

The project is a small but complete AI document summarization stack: the frontend gathers a document, the backend validates and extracts text, and the Gemini model produces structured summaries. The system is intentionally simple and stateless, which makes it easy to run locally and easy to understand, but it also means there is no persistence, no auth, and no realistic production workflow.

The mental model is:

- `App.tsx` is the application shell and orchestration layer.
- `server.py` is the processing engine and API.
- Google Gemini is the intelligence layer.
- PyMuPDF and Tesseract handle document parsing.
- `types.ts` defines the contract between UI and API.
- `test_document_summary.py` validates the critical behavior.

The most critical files a new engineer should read first:
1. `server.py`
2. `App.tsx`
3. `types.ts`
4. `test_document_summary.py`
5. `README.md`
6. `APPROACH.md`

If this were to be evolved into a production product, the next architectural steps would be:
- add persistence and storage
- add authentication and audit trails
- add queues for async processing
- add monitoring and error telemetry
- secure secrets and remove committed env files from version control

> The repository is a focused proof-of-concept / MVP for AI document summarization rather than a full enterprise application. Its strength is clarity and fast iteration; its main gaps are persistence, security, and production platform readiness.