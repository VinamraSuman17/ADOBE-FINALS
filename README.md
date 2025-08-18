# AI-Powered PDF Analysis - Adobe Hackathon 2025 Submission (Finale)

## Overview
This project is a full-stack AI-powered document intelligence system, built as the **Finale submission for the Adobe India Hackathon 2025**.  

It ingests a user’s prior PDFs, analyzes a selected text from a current document, finds deep cross-document connections using AI, and generates a two-speaker podcast from the insights.  
The system also provides an interactive PDF preview powered by Adobe PDF Embed API, enabling users to explore documents seamlessly.  

Our solution builds directly on prior rounds:
- **Round 1A (Proper PDF Extractor):** Used for section extraction and accurate page navigation.  
- **Round 1B (Persona-Based Analyzer):** Used for relevance scoring and summaries.  
- **Finale Enhancements with Gemini 2.5 Flash:** Advanced semantic similarity, knowledge synthesis, and direct TTS support.  

---

## Our Approach: From 1A + 1B to Finale
We designed the Finale system as a natural evolution of our earlier work:

1. **Foundation from Round 1A**  
   - Section and heading detection logic is reused for **page mapping**.  
   - Ensures navigation reliability when jumping to relevant snippets inside a PDF.  

2. **Core Logic from Round 1B**  
   - Relevance scoring between the new/current document and prior uploaded PDFs.  
   - Provides **initial summaries and ranking of relevance**.  

3. **Gemini 2.5 Flash Enhancements**  
   - Refines similarity detection across documents.  
   - Produces richer, higher-quality summaries and multi-perspective insights.  
   - Powers **direct TTS** for podcast generation, removing dependency on Azure TTS.  

---

## Technology Stack & Rationale

| Component | Tool Chosen | Why We Chose It (Advantages) | Alternatives Considered & Why Not Used |
|-----------|-------------|-------------------------------|----------------------------------------|
| Backend | FastAPI | High performance, async support, and clean routing for APIs. | Flask: lightweight but less modern for async workflows. |
| Frontend | React (Vite + Tailwind) | Fast bundling, component-driven UI, simple integration with Adobe PDF Embed. | CRA (slower), Angular/Vue (heavier). |
| PDF Handling | PyMuPDF (fitz) | Used for fast, accurate text extraction and page-level navigation. | PyPDF2 (less reliable), pdfplumber (slower). |
| Semantic Search | scikit-learn (TF-IDF + cosine similarity) | Lightweight, fast, CPU-only. | Heavy vector DBs (Pinecone, FAISS). |
| AI/LLM | Gemini 2.5 Flash | State-of-the-art reasoning, summarization, and also supports TTS in our implementation. | GPT/Claude: not allowed; Sentence-Transformers lacked reasoning. |
| TTS | Gemini (built-in) | Direct script + speech generation; no external dependency required. | Azure TTS supported, but not used in our final build. |
| Storage | Local FS | Simple, hackathon-ready: `storage/pdfs/`, `storage/audio/`, `storage/temp/`. | Cloud/CDN: unnecessary for offline/demo. |

---

## Solution Architecture & Workflow

1. **Initialization**
   - User uploads prior PDFs (`POST /ingest-prior-documents/`).  
   - Each file is assigned a UUID, metadata, and stored in `storage/pdfs`.  

2. **Current Document Setup**
   - User uploads the document they are reading (`POST /set-current-document/`).  

3. **Selection & Analysis**
   - User selects a text span in the current PDF.  
   - System performs:  
     - **Round 1A logic:** Finds correct section and page number for navigation.  
     - **Round 1B logic:** Scores relevance and generates draft summaries.  
     - **Gemini 2.5 Flash:** Enhances summaries, generates deeper cross-document insights, and synthesizes final results.  

4. **Interactive PDF Preview**
   - Adobe PDF Embed API loads the relevant PDF.  
   - Navigation, zoom, and text selection events are supported.  
   - *Known Issue:* `goToLocation` API repeatedly errored in testing. Other functions (zoom, preview, selection) worked reliably.  

5. **Podcast Generation (Optional)**
   - User requests a podcast (`POST /generate-podcast/`).  
   - Gemini 2.5 Flash generates both **script + TTS audio**.  
   - Audio stored in `storage/audio` and served via `/audio/{filename}`.  

---

## Setup and Execution Instructions

### Step 1: Build the Docker Image

docker build --platform linux/amd64 -t yourimageidentifier .

Step 2: Run the Container
For Linux/macOS
docker run -v /path/to/credentials:/credentials \
  -e ADOBE_EMBED_API_KEY="enter-your-adobe-api-key-here" \
  -e GEMINI_API_KEY="enter-your-gemini-api-key-here" \
  -e LLM_PROVIDER="gemini" \
  -e GOOGLE_APPLICATION_CREDENTIALS="/credentials/adbe-gcp.json" \
  -e GEMINI_MODEL="gemini-2.5-flash" \
  -e TTS_PROVIDER="gemini" \
  -p 8080:8080 yourimageidentifier
docker build --platform linux/amd64 -t yourimageidentifier .


For Windows (PowerShell)
docker run -v "C:\Users\User\OneDrive\Desktop\Adobe:/credentials" `
  -e ADOBE_EMBED_API_KEY="enter-your-adobe-api-key-here" `
  -e GEMINI_API_KEY="enter-your-gemini-api-key-here" `
  -e LLM_PROVIDER="gemini" `
  -e GOOGLE_APPLICATION_CREDENTIALS="/credentials/adbe-gcp.json" `
  -e GEMINI_MODEL="gemini-2.5-flash" `
  -e TTS_PROVIDER="gemini" `
  -p 8080:8080 yourimageidentifier

Step 3: Start the Frontend
cd frontend
npm install
npm run dev


Backend: http://localhost:8080

Frontend: http://localhost:5173
