# syntax=docker/dockerfile:1

############################
# Frontend build (Vite)
############################
FROM --platform=$BUILDPLATFORM node:20-alpine AS fe-build
WORKDIR /app/frontend

# Install deps
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

############################
# Backend deps layer
############################
FROM --platform=$BUILDPLATFORM python:3.11-slim AS be-deps
WORKDIR /app

# System packages needed by PyMuPDF and runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ \
    libjpeg62-turbo-dev zlib1g-dev libpng-dev \
    libfreetype6-dev libharfbuzz-dev libfribidi-dev \
    libopenjp2-7 libtiff6 liblcms2-2 libwebp7 \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

############################
# Final runtime image
############################
FROM --platform=linux/amd64 python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    # Optional defaults (overridden at runtime)
    LLM_PROVIDER= \
    GOOGLE_APPLICATION_CREDENTIALS= \
    GEMINI_MODEL= \
    ADOBE_EMBED_API_KEY= \
    GEMINI_API_KEY= \
    TTS_PROVIDER= \
    AZURE_TTS_KEY= \
    AZURE_TTS_ENDPOINT= \
    DATABASE_URL= \
    APP_ENV=prod

# Minimal runtime packages
RUN apt-get update && apt-get install -y --no-install-recommends tini curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m appuser
WORKDIR /app

# Bring in Python site-packages and scripts installed in deps stage
COPY --from=be-deps /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=be-deps /usr/local/bin /usr/local/bin

# Copy backend source
COPY backend/ /app/backend/

# Copy built frontend
COPY --from=fe-build /app/frontend/dist /app/frontend/dist

# Create writable storage dirs
RUN mkdir -p /app/backend/storage/pdfs /app/backend/storage/audio /app/backend/storage/temp && \
    chown -R appuser:appuser /app

ENV PYTHONPATH=/app/backend


USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://127.0.0.1:8080/health || exit 1

# Start FastAPI (ensure backend.app.main:app exists)
CMD ["/usr/bin/tini","--","python","-m","uvicorn","backend.app.main:app","--host","0.0.0.0","--port","8080"]
