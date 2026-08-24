# Approach

The Document Summary Assistant follows a simple pipeline that transforms uploaded documents into structured summaries using OCR, text extraction, and a Large Language Model (LLM).

The application is built with a React frontend and a FastAPI backend. Users can upload PDF documents or image files through the web interface. The backend first validates the file type and size to ensure only supported documents (PDF, PNG, JPG) within the 10 MB limit are processed.

For PDF files, text is extracted using PyMuPDF, which preserves the document’s textual content efficiently. For image-based documents or scanned pages, Tesseract OCR is used to convert visual text into machine-readable content. Once the text is extracted, it is cleaned and checked for minimum readability requirements. Extremely large documents are truncated to a predefined character limit to maintain predictable processing time and API costs.

The extracted text is then sent to Google's Gemini 3.6 Flash model with a carefully designed prompt requesting a structured JSON response. The model generates three levels of summaries (short, medium, and detailed), along with key points and improvement suggestions. Pydantic schemas validate the returned JSON to ensure consistency and prevent malformed responses from reaching the frontend.

Finally, the validated summary data is returned through the API and displayed in the user interface, providing users with concise insights from lengthy documents in seconds.
