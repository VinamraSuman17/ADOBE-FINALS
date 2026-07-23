# PDF AI Assistant - Document Intelligence Platform

An AI-powered document intelligence platform that understands the structure of PDF documents, finds semantic connections across files, generates structured synthesis reports, and creates narrative audio summaries (podcasts). Built with an interactive UI utilizing the Adobe PDF Embed API for in-browser document review and highlighting.

## Tech Stack

- **Backend:** FastAPI (Python), PyMuPDF (fitz), SentenceTransformers (all-MiniLM-L6-v2), scikit-learn (TF-IDF + Cosine Similarity), google-generativeai (Gemini 2.5 Flash), Azure OpenAI (TTS)
- **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons, Framer Motion, Adobe PDF Embed API
- **Deployment:** Docker support

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)

### Setup Virtual Environment & Backend
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install python dependencies
pip install -r requirements.txt
```

### Setup Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install
```

## Environment Setup

Duplicate the environment template files and populate them with your API keys:

### Backend Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Populate `backend/.env` with your API keys:
- `GEMINI_API_KEY`: Required for Gemini AI insights generation.
- `AZURE_TTS_KEY` & `AZURE_TTS_ENDPOINT`: Optional, required to enable Azure OpenAI Speech synthesis (falls back to a default MP3 generator if keys are absent).

### Frontend Configuration
Create a `.env` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env
```
Populate `frontend/.env` with your API keys:
- `VITE_ADOBE_API_KEY`: Your Adobe PDF Embed API client ID.
- `VITE_API_URL`: Optional, URL of your running backend (defaults to `http://localhost:8080`).

## Running the Backend

Start the FastAPI application server locally:
```bash
cd backend
PYTHONPATH=. venv/bin/python app/main.py
```
The server will run on `http://localhost:8080`. API documentation is available at `http://localhost:8080/docs`.

## Running the Frontend

Start the Vite development server locally:
```bash
cd frontend
npm run dev
```
The application will be accessible at `http://localhost:5173`.
