# IntelliDoc AI — Backend Verification Platform

The backend provides the high-performance perception, LLM claim extraction, and deterministic verification engine for IntelliDoc AI, built with **FastAPI**, **PostgreSQL 18**, **SQLAlchemy**, and **Pydantic**.

## Architecture & Services

```text
runtime_app/backend/
├── app/
│   ├── database.py              # PostgreSQL engine and session factory
│   ├── models/                  # 14 SQLAlchemy ORM models (documents, pages, ocr_regions, claims, evidence, reports, etc.)
│   ├── schemas/                 # Pydantic validation schemas for API requests/responses
│   ├── routers/                 # Modular API controllers
│   │   ├── documents.py         # Upload, list, metadata, page image streaming
│   │   ├── claims.py            # Claim retrieval and Gemini extraction
│   │   └── verification.py      # Deterministic verification & cross-document reconciliation
│   └── services/                # Core processing pipelines
│       ├── document_service.py  # SHA-256 calculation, PDFium page rendering
│       ├── ocr_service.py       # Tesseract v5.5 OCR word tokenization & coordinates
│       ├── layout_service.py    # Fine-tuned LayoutLMv3 token classification (header/question/answer/other)
│       ├── llm_extraction_service.py # Gemini 3.5 Flash Lite structured claim extraction
│       ├── rule_engine.py       # Pure Python deterministic arithmetic, temporal, & cross-doc rules
│       ├── external_registry_service.py # PostgreSQL vendor authority registry lookups
│       └── verification_service.py # Tri-state evidence synthesis and audit narrative generation
├── alembic/                     # Database schema migrations
├── uploads/                     # Storage for original documents and rendered page PNGs
├── main.py                      # FastAPI entrypoint with CORS, routes, and static mounts
└── requirements.txt             # Python dependencies
```

## Core Safety Invariant: Zero LLM Arithmetic Hallucination

A foundational design principle of IntelliDoc AI is that **LLMs are strictly restricted to semantic extraction**. Under no circumstances is an LLM trusted with arithmetic, subtotal-tax summation, line-item multiplication, or temporal chronologies.

- **Extraction**: Handled by Gemini 3.5 Multimodal via structured Pydantic schemas.
- **Verification**: Handled by pure deterministic Python rules (`rule_engine.py`) and database lookups (`external_registry_service.py`).
- **Audit Reports**: Output a tri-state decision (`VERIFIED`, `REQUIRES_HUMAN_REVIEW`, `UNVERIFIABLE`) alongside an explainable natural language narrative.

## Running the Backend

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Start Uvicorn development server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation (Swagger UI) is available at:
`http://127.0.0.1:8000/docs`
