# IntelliDoc AI — Frontend Audit Dashboard

A modern, responsive Next.js application designed for multimodal document inspection, claim exploration, and explainable evidence verification.

## Features & Views

1. **Document Repository & Ingestion**:
   - Drag-and-drop file upload supporting PDF, PNG, and JPEG documents.
   - Live repository list displaying document metadata, SHA-256 hashes, processing status, and verification decision badges.

2. **Multimodal Perception Visualizer (Tab 1)**:
   - High-resolution document viewport with dynamic scaling.
   - Interactive bounding box overlays classified by the fine-tuned LayoutLMv3 checkpoint:
     - 🟣 **Header** (Document titles, section headings)
     - 🔵 **Question** (Field labels, metadata keys)
     - 🟢 **Answer** (Extracted values, amounts)
     - ⚪ **Other** (Boilerplate text, disclaimers)
   - Hover inspection displaying token text, classification category, and OCR confidence.

3. **Structured Claim Store (Tab 2)**:
   - Tabular view of all factual claims extracted by the Gemini Multimodal pipeline.
   - Attributes include claim field, normalized value, inferred data type, and verification status.

4. **Verification & Evidence Audit Trail (Tab 3)**:
   - Prominent Decision Banner:
     - 🟢 `VERIFIED`
     - 🟡 `REQUIRES HUMAN REVIEW`
     - ⚪ `UNVERIFIABLE`
   - Metric overview (Passed checks, failed discrepancies, total evaluated rules).
   - Explainable Natural Language Audit Narrative detailing exactly why anomalies were flagged.
   - Full Evidence Checklist displaying rule source, evaluation category, status badge, finding description, and authority tier.

## Running the Frontend

```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
