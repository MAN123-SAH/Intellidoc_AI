# IntelliDoc AI
### Evidence-Driven Explainable Multimodal Document Intelligence & Verification System

IntelliDoc AI is an enterprise-grade document intelligence and verification platform that bridges the gap between multimodal document perception and deterministic factual verification.

> **Core System Axiom:** *Extraction is NOT Verification.*

---

## 🌟 Key Features

1. **Multimodal Spatial Perception:**
   - Word tokenization & bounding box extraction via **Tesseract OCR v5.5**.
   - Spatial visual layout token classification (`header`, `question`, `answer`, `other`, line items) powered by fine-tuned **LayoutLMv3** transformers.
   - Fine-tuned on **FUNSD** (85.2% F1) and **CORD v2** (90.02% F1).

2. **Structured Factual Claim Store:**
   - Zero-shot multimodal extraction via **Gemini 2.5 Flash** with strict Pydantic JSON schemas.
   - Relational persistence in **PostgreSQL 18** (`documents`, `pages`, `ocr_regions`, `claims`, `evidence`, `reports`).

3. **Deterministic Verification Engine (0.0% Hallucination):**
   - **Line-item arithmetic:** $\text{Quantity} \times \text{Unit Price} = \text{Line Total}$.
   - **Cross-sum invariants:** $\sum \text{Line Totals} = \text{Subtotal}$ and $\text{Subtotal} + \text{Tax} + \text{Shipping} = \text{Total}$.
   - **Temporal chronology:** Asserts $\text{Invoice Date} \le \text{Due Date}$.
   - **Vendor authority registry:** Validates business identity against active/suspended database records.

4. **Two-Way Cross-Document Reconciliation:**
   - Compares contractual Purchase Orders against billing Invoices to detect quantity overbilling, unit price inflation, and unauthorized expenditure.

5. **Signature Evidence Traceability & Workspace:**
   - 10-view enterprise UI built in **Next.js 16** with Tailwind CSS v4.
   - Signature **3-Panel Document Intelligence Studio** with scaled visual OCR bounding box overlays.
   - Interactive **Evidence Traceability Chain** mapping $\text{Document} \rightarrow \text{Claim} \rightarrow \text{Rule Evidence} \rightarrow \text{Decision}$.
   - Tri-state verdict taxonomy: `VERIFIED`, `REQUIRES REVIEW`, or `UNVERIFIABLE`.

---

## 🏗️ Architecture

```
+------------------------------------------------------------------+
|                    PRESENTATION LAYER                            |
| Next.js 16 Enterprise SPA • Tailwind CSS • Responsive 3-Panel    |
+---------------------------------+--------------------------------+
                                  | REST API (JSON)
+---------------------------------v--------------------------------+
|                    API & ROUTING LAYER                           |
| FastAPI Web Server • Uvicorn • CORS • Background Task Queues     |
+---------------------------------+--------------------------------+
                                  |
+---------------------------------v--------------------------------+
|                 MULTIMODAL INTELLIGENCE CORE                     |
| 1. Ingestion: SHA-256 Hashing, PDF Page Splitter, PIL Normalizer |
| 2. Perception: Tesseract v5.5 OCR + Fine-Tuned LayoutLMv3        |
| 3. Extraction: Gemini 2.5 Flash Multimodal Structured Parser     |
| 4. Verification: Deterministic Python / SymPy Symbolic Engine    |
+---------------------------------+--------------------------------+
                                  | SQLAlchemy ORM
+---------------------------------v--------------------------------+
|                    PERSISTENCE LAYER                             |
| PostgreSQL 18 Relational DB: documents, pages, ocr_regions,      |
| claims, evidence, verification_results, reports, audit_logs       |
+------------------------------------------------------------------+
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10 – 3.12
- Node.js v20+ & npm
- PostgreSQL 16+
- Tesseract OCR v5.5

### 1. Database Setup
Create a PostgreSQL database named `intellidoc`:
```sql
CREATE DATABASE intellidoc;
```

### 2. Backend Setup
```bash
cd runtime_app/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
copy .env.example .env
# Edit .env and enter your PostgreSQL password and Gemini API Key

# Start FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd runtime_app/frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📊 Research & Benchmarks

Research notebooks are located in `offline_research/notebooks/`:
- `01_funsd_dataset_validation.ipynb`: FUNSD dataset profiling & visualization.
- `02_layoutlmv3_baseline.ipynb`: LayoutLMv3 baseline evaluation on FUNSD.
- `03_layoutlmv3_finetune.ipynb`: LayoutLMv3 fine-tuning on FUNSD (85.2% F1).
- `04_cord_dataset_validation.ipynb`: CORD v2 dataset validation on Colab.
- `05_layoutlmv3_cord_baseline.ipynb`: CORD baseline evaluation (1.04% F1).
- `06_layoutlmv3_cord_finetune.ipynb`: CORD line-item fine-tuning (90.02% F1).

### Evaluation Benchmark Results
| Evaluation Metric | Ground-Truth Score |
| :--- | :---: |
| Verification Accuracy | **100.0%** (9/9 Test Scenarios) |
| Fraud Detection Precision | **100.0%** (Zero False Positives) |
| Anomaly Recall | **100.0%** (All Injected Tampering Caught) |
| LLM Math Hallucination | **0.0%** (Guaranteed by Symbolic Rule Engine) |

---

## 🔒 Security & Privacy Notice
- `.env` files containing database passwords and API keys are strictly excluded via `.gitignore`.
- User uploaded files in `runtime_app/backend/uploads/` are excluded from version control.
- Model weights (`.safetensors`, `.bin` > 100MB) are excluded from standard Git tracking and should be stored in Google Drive or HuggingFace.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
