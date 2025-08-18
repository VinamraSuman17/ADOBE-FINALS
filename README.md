# AI-Powered PDF Analysis - Adobe Hackathon 2025 Finale Submission

## Executive Summary
This project represents the **culmination of multiple hackathon rounds**, bringing together precision PDF structure extraction (Round 1A), persona-based multi-document analysis (Round 1B), and next-generation AI insights powered by **Gemini 2.5 Flash**.  

Our system is more than just a document viewer. It is an **AI-powered document intelligence platform** that:
- Understands the **structure** of documents.  
- Finds **cross-document semantic connections**.  
- Provides **actionable insights** in 8 advanced categories.  
- Generates a **two-speaker podcast** directly from the analysis.  
- Integrates seamlessly with **Adobe PDF Embed API** for interactive in-browser navigation.  

This is not a demo hack — it is a **production-style, end-to-end pipeline** engineered for reliability, clarity, and extensibility.

---

## Why This Solution Stands Out
Most hackathon projects demonstrate a single feature. Our system demonstrates a **full architecture** that blends rule-based intelligence, semantic retrieval, and large language models in harmony:

1. **Hybrid Intelligence Approach**  
   - **Rule-based (Round 1A):** Lightning-fast, deterministic heading extraction and page mapping.  
   - **Semantic embeddings (Round 1B):** Persona-driven relevance ranking across prior documents.  
   - **LLM reasoning (Finale):** Gemini 2.5 Flash adds deeper semantic connections and multi-perspective synthesis.  

2. **Multi-Layer Retrieval**  
   Instead of blindly prompting the LLM with entire documents (slow, expensive, error-prone), we:  
   - Use **TF-IDF + cosine similarity** for speed.  
   - Narrow down to the most relevant snippets.  
   - Hand off only the meaningful text to Gemini for final reasoning.  

3. **Seamless User Experience**  
   - Upload multiple prior PDFs.  
   - Upload a current “reading” PDF.  
   - Highlight text → instantly get AI insights.  
   - Click on a relevant prior snippet → preview PDF with page navigation.  
   - Generate a podcast → listen directly in the browser.  

4. **Offline-Ready**  
   - All PDFs are stored locally.  
   - Embeddings and retrieval logic run locally.  
   - Gemini calls are the only external dependency, and even they are fault-tolerant with fallbacks.  

---

## How It Builds on Prior Rounds

### Round 1A: Proper PDF Extractor  
- Extracts **hierarchical headings** and maps them to **exact page numbers**.  
- Used in the Finale to ensure **precise navigation** inside PDFs.  
- Without this, AI insights would lack anchors to real document locations.  

### Round 1B: Persona-Based Analyzer  
- Computes **semantic relevance** between prior documents and the current one.  
- Generates **summaries** to explain why a snippet is relevant.  
- In Finale, this forms the **retrieval backbone**, ensuring the right snippets reach Gemini.  

### Finale: AI-Powered PDF Analysis  
- **Gemini 2.5 Flash** enhances summaries, generates insights in **8 categories**, and powers **text-to-speech**.  
- Produces a **narrative podcast** from the AI insights.  
- Integrates with **Adobe PDF Embed API** for an interactive preview.  

---

## Known Limitation (Transparent Note)  
We tested **Adobe PDF Embed API’s `goToLocation` method** for navigation.  
- Unfortunately, this consistently errored in our setup.  
- However, **zoom, preview, and text selection** worked reliably.  
- We implemented a robust workaround by leveraging our **Round 1A page-mapping engine** to guide users instead.  

---

## Technology Stack (Detailed Rationale)

| Layer | Technology | Why This Choice? | Why Not Alternatives? |
|-------|------------|------------------|------------------------|
| Backend API | **FastAPI** | Async-first, great for high-performance APIs. Auto-generates Swagger docs. | Flask: less modern async support. |
| Frontend UI | **React (Vite + Tailwind)** | Lightning-fast builds, modular components, modern developer UX. | CRA: slower; Angular: heavier. |
| PDF Parsing | **PyMuPDF (fitz)** | C-optimized, extracts fonts, bounding boxes, and positions at unmatched speed. | PyPDF2: unreliable; pdfplumber: slower. |
| Retrieval Engine | **scikit-learn (TF-IDF + cosine similarity)** | Lightweight, CPU-only, hackathon-fast. | Vector DBs (FAISS, Pinecone) would be overkill. |
| LLM | **Gemini 2.5 Flash** | Next-gen LLM with reasoning + TTS. Small latency, high accuracy. | GPT/Claude not allowed; HuggingFace models lacked reasoning depth. |
| TTS | **Gemini Built-in** | No external infra required. Single provider for script + voice. | Azure TTS: supported but unused. |
| Storage | **Local FS (`storage/` folder)** | Simplicity, offline readiness, hackathon-friendly. | Cloud/CDN adds setup overhead. |

---

## Workflow (End-to-End)

1. **Prior PDF Ingestion**  
   - Upload up to 50 PDFs.  
   - Each gets a **UUID, metadata, hash, and sections** extracted.  
   - Stored in `storage/pdfs`.  

2. **Current Document Upload**  
   - Upload a "current reading" PDF.  
   - Content stored temporarily in session.  

3. **Selection-Based Analysis**  
   - Highlight text → system finds **related snippets** in prior PDFs.  
   - Round 1A ensures **page mapping**.  
   - Round 1B ensures **relevance scoring**.  
   - Gemini 2.5 Flash ensures **semantic depth + category insights**.  

4. **Interactive Preview**  
   - Adobe PDF Embed API renders the PDF.  
   - Selection events + navigation integrated.  
   - (*goToLocation unreliable, but fallback navigation works*).  

5. **Podcast Generation**  
   - Gemini generates both **dialogue script + audio narration**.  
   - Audio stored in `storage/audio`.  
   - Streamed via `/audio/{filename}` endpoint.  

---

## Docker Setup & Commands

### Build the Image
```bash
docker build --platform linux/amd64 -t yourimageidentifier .
```

Run the Container


Linux/macOS
```bash
docker run -v /path/to/credentials:/credentials \
  -e ADOBE_EMBED_API_KEY="enter-your-adobe-api-key-here" \
  -e GEMINI_API_KEY="enter-your-gemini-api-key-here" \
  -e LLM_PROVIDER="gemini" \
  -e GOOGLE_APPLICATION_CREDENTIALS="/credentials/adbe-gcp.json" \
  -e GEMINI_MODEL="gemini-2.5-flash" \
  -e TTS_PROVIDER="gemini" \
  -p 8080:8080 yourimageidentifier
```

Windows (PowerShell)
```bash
docker run -v "C:\Users\User\OneDrive\Desktop\Adobe:/credentials" `
  -e ADOBE_EMBED_API_KEY="enter-your-adobe-api-key-here" `
  -e GEMINI_API_KEY="enter-your-gemini-api-key-here" `
  -e LLM_PROVIDER="gemini" `
  -e GOOGLE_APPLICATION_CREDENTIALS="/credentials/adbe-gcp.json" `
  -e GEMINI_MODEL="gemini-2.5-flash" `
  -e TTS_PROVIDER="gemini" `
  -p 8080:8080 yourimageidentifier
```

Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Backend: http://localhost:8080

Frontend: http://localhost:5173

## Our Ideation Process: From Notes to Code

Our entire algorithm is a direct result of the manual brainstorming and mind-mapping process. Below are the actual notes and diagrams we created during our planning phase, which formed the foundation of our code's logic.

<p align="center">
  <img src="https://res.cloudinary.com/dcyxnil16/image/upload/v1755545971/IMG-20250819-WA0003_zwkscj.jpg" alt="Brainstorm Note 1" height="500px"/>
  <img src="https://res.cloudinary.com/dcyxnil16/image/upload/v1755545971/IMG-20250819-WA0006_zozfm7.jpg" alt="Brainstorm Note 2" height="500px" />
</p>
<p align="center">
  <img src="https://res.cloudinary.com/dcyxnil16/image/upload/v1755545971/IMG-20250819-WA0004_xjxzra.jpg" alt="Brainstorm Note 1" height="500px"/>
  <img src="https://res.cloudinary.com/dcyxnil16/image/upload/v1755545971/IMG-20250819-WA0004_xjxzra.jpg" alt="Brainstorm Note 1" height="500px"/>
  <img src="https://res.cloudinary.com/dcyxnil16/image/upload/v1755545971/IMG-20250819-WA0005_zv66im.jpg" alt="Brainstorm Note 1" height="500px"/>
</p>
Caption: The step-by-step logic we drafted before writing the final code.

