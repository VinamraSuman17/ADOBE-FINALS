# AI-Powered PDF Analysis - Adobe Hackathon 2025 Finale Submission

## Executive Summary
This project represents the **culmination of multiple hackathon rounds**, bringing together precision PDF structure extraction (Round 1A), persona-based multi-document analysis (Round 1B), and next-generation AI insights powered by **Gemini 2.5 Flash**.  

Our system is more than just a document viewer. It is an **AI-powered document intelligence platform** that:
- Understands the **structure** of documents.  
- Finds **cross-document semantic connections**.  
- Provides **actionable insights** in 8 advanced categories.  
- Generates a **two-speaker podcast** directly from the analysis.  
- Integrates seamlessly with **Adobe PDF Embed API** for interactive in-browser navigation.  

This Finale unifies our earlier Challenge 1A and 1B systems into a single, production‑style, end‑to‑end platform:
- From 1A, we inherit precise, rule‑based PDF structure extraction that maps hierarchical headings to exact pages for rock‑solid navigation anchors.
- From 1B, we inherit persona‑aware multi‑document retrieval and ranking that surfaces the most relevant snippets with concise, human‑readable rationales.
- In the Finale, Gemini 2.5 Flash layers deep reasoning, multi‑perspective synthesis, and text‑to‑speech to generate 8‑category insights and a two‑speaker narrative podcast.

This is more than a viewer: it understands structure, connects related ideas across PDFs, surfaces actionable insights, lets users interactively navigate content in the browser via Adobe PDF Embed API, and produces audio outputs.

---

## Why This Solution Stands Out
Most hackathon projects demonstrate a single feature. Our system demonstrates a **full architecture** that blends rule-based intelligence, semantic retrieval, and large language models in harmony:

### Hybrid Intelligence
- Rule‑based (from 1A): Deterministic, lightning‑fast heading extraction and page mapping using font features, patterns, and positional heuristics—no ML required for structure.
- Semantic retrieval (from 1B): Persona + “job‑to‑be‑done” guided embeddings with TF‑IDF/cosine filtering ensure only the most relevant text flows forward.
- LLM reasoning (Finale): Gemini 2.5 Flash performs the final, deeper semantic synthesis and powers high‑quality TTS.

### Multi‑Layer Retrieval
- We never dump entire PDFs into the LLM.
- TF‑IDF + cosine similarity narrows to the best snippets quickly and efficiently.
- Only meaningful, context‑rich excerpts reach Gemini for final reasoning.

### Seamless User Experience
- Upload multiple “prior” PDFs.
- Upload a current “reading” PDF.
- Highlight text → instant AI insights.
- Click a relevant snippet → PDF preview with navigation.
- Generate a podcast → listen in the browser.

### Built For Students: Fast, Efficient, Single‑Model Design
 - We built this with students in mind—simple setup, low compute, responsive UX. The core retrieval runs on a single compact model (~80–100MB), ensuring it works efficiently and fast on typical laptops without GPUs. This keeps downloads light, memory use modest, and interactions snappy.
---

## How It Builds on Prior Rounds

### Round 1A: Proper PDF Extractor  (refer to 'https://github.com/VinamraSuman17/ADOBE-TEAM-SPARK-1A')
- Extracts **hierarchical headings** and maps them to **exact page numbers**.  
- Used in the Finale to ensure **precise navigation** inside PDFs.  
- Without this, AI insights would lack anchors to real document locations.  

### Round 1B: Persona-Based Analyzer (refer to 'https://github.com/VinamraSuman17/ADOBE-TEAM-SPARK-1B')  
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
   - **Gemini** generates the **dialogue script**.  
   - **Azure OpenAI (Text-to-Speech)** converts the script into **audio narration** with chosen voices.  
   - Audio is stored in `storage/audio`.  
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
docker run -v "/path/to/your/adobe/folder:/credentials" \
  -e ADOBE_EMBED_API_KEY="enter-your-adobe-api-key-here" \
  -e GEMINI_API_KEY="enter-your-gemini-api-key-here" \
  -e LLM_PROVIDER="gemini" \
  -e GOOGLE_APPLICATION_CREDENTIALS="/credentials/adbe-gcp.json" \
  -e GEMINI_MODEL="gemini-2.5-flash" \
  -e TTS_PROVIDER="azure" \
  -e AZURE_TTS_KEY="enter-your-azure-tts-key-here" \
  -e AZURE_TTS_ENDPOINT="enter-your-azure-tts-endpoint-here" \
  -e AZURE_TTS_DEPLOYMENT="enter-your-azure-tts-deployment-here" \
  -e AZURE_TTS_API_VERSION="2024-05-01-preview" \
  -e AZURE_TTS_VOICE="alloy" \
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
  -e TTS_PROVIDER="azure" `
  -e AZURE_TTS_KEY="enter-your-azure-tts-key-here" `
  -e AZURE_TTS_ENDPOINT="enter-your-azure-tts-endpoint-here" `
  -e AZURE_TTS_DEPLOYMENT="enter-your-azure-tts-deployment-here" `
  -e AZURE_TTS_API_VERSION="2024-05-01-preview" `
  -e AZURE_TTS_VOICE="alloy" `
  -p 8080:8080 yourimageidentifier

```

Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
## Environment Configuration

### Backend `.env`

``` bash
GEMINI_API_KEY=
ADOBE_API_KEY=

TTS_PROVIDER=azure
AZURE_TTS_KEY=
AZURE_TTS_ENDPOINT=
AZURE_TTS_DEPLOYMENT=
AZURE_TTS_API_VERSION=
AZURE_TTS_VOICE=
```

### Frontend `.env`

``` bash
VITE_ADOBE_API_KEY=
```

### Cold Start Note (Please Read)
- On the very first run after building/pulling the image, Docker may perform initialization steps that can cause a cold start delay.
- This can take up to ~10 minutes depending on hardware, disk, and network (if model downloads or validations run).
- Subsequent runs will be much faster. Please wait patiently during this first start.

## Local Development

### Backend
- URL: http://localhost:8080

### Frontend
- URL: http://localhost:5173

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

We designed first and coded second. The 1A and 1B rounds came from deep, manual brainstorming:
- 1A emphasized human‑intuition automation: how people visually detect structure became deterministic rules.
- 1B emphasized persona‑centric triage: how people decide “what matters for this role” became embedding‑guided retrieval with succinct summaries.
- The Finale stitches these strengths into a fluid UX with interactive preview and audio storytelling.

## Operational Notes & Tips
- If the PDF viewer doesn’t jump to a page: copy the page number from the UI hint and use the built‑in page navigator; our 1A page anchors keep references exact.
- If podcast audio doesn’t appear immediately: refresh the insights, then check `storage/audio` and reload the player; first TTS invocations can add a short delay.
- For best retrieval quality: upload representative “prior” PDFs that match the persona and task, then highlight specific text in the current PDF to trigger focused insights.


---


