# 🔍 Sovereign Local OCR Sidecar (Baidu Unlimited-OCR 3B MoE)

A sovereign, zero-external-network Python FastAPI sidecar for multimodal financial receipt scanning, tax invoice parsing, and line-item extraction.

## Features
- **Baidu Unlimited-OCR (3B MoE VLM)**: High-precision character and tabular recognition.
- **PaddleOCR Fallback**: Ultra-lightweight CPU/NPU optical character recognition.
- **Strict JSON Schema**: Emits verified, structured receipts with CGST, SGST, IGST, HSN codes, and line items.
- **FastAPI Endpoints**:
  - `GET /health` — Service readiness probe.
  - `POST /ocr/receipt` — Structured bill and receipt extraction.

## Running Locally

### Option 1: Direct Python
```bash
pip install -r requirements.txt
python main.py
```

### Option 2: Docker Container
```bash
docker build -t richy-ocr-sidecar .
docker run -p 8001:8001 richy-ocr-sidecar
```
