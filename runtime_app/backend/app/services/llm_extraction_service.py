import os
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Document, Page, OCRRegion, Claim, Evidence, VerificationResult, AuditLog, VerificationStatus

EXTRACTION_PROMPT = """
You are the Claim Extraction Module of the IntelliDoc AI Verification Engine.
Your task is to extract all factual business claims from the provided document image.

CRITICAL INSTRUCTIONS:
1. Extract values exactly as they appear on the document. Do not invent, hallucinate, or recalculate values.
2. Return ONLY a valid JSON object matching the schema below. No markdown fences, no conversational prose.
3. If a field is not present on the document, use null.

JSON SCHEMA:
{
  "document_type": "invoice" | "purchase_order" | "certificate" | "receipt" | "unknown",
  "vendor_name": string or null,
  "vendor_address": string or null,
  "customer_name": string or null,
  "customer_address": string or null,
  "invoice_number": string or null,
  "invoice_date": string or null,
  "due_date": string or null,
  "purchase_order_number": string or null,
  "currency": string or null,
  "subtotal": number or null,
  "tax_amount": number or null,
  "shipping_amount": number or null,
  "grand_total": number or null,
  "line_items": [
    {
      "description": string,
      "quantity": number,
      "unit_price": number,
      "total": number
    }
  ]
}
"""


def find_matching_bbox(value_str: str, regions: List[OCRRegion]) -> Optional[List[int]]:
    """Attempts to find the bounding box of an extracted value in OCR regions."""
    if not value_str or not regions:
        return None

    val_clean = str(value_str).strip().lower()
    for r in regions:
        if val_clean in r.text.lower() or r.text.lower() in val_clean:
            return r.bbox
    return None


def get_gemini_api_key() -> str:
    """Retrieves GEMINI_API_KEY from environment or Windows Registry."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as key:
                val, _ = winreg.QueryValueEx(key, "GEMINI_API_KEY")
                if val:
                    api_key = val
        except Exception:
            pass

    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GEMINI_API_KEY is not set. Please set it in your Windows Environment Variables."
        )
    return api_key


def extract_claims_with_gemini(document: Document, db: Session) -> List[Claim]:
    """
    Extracts structured Claims using the modern Google GenAI API:
    - Reads GEMINI_API_KEY from Windows environment variables or Windows Registry.
    - Sends page image to Gemini multimodal vision.
    - Parses structured JSON response.
    - Writes Claim entities to PostgreSQL.
    """
    api_key = get_gemini_api_key()

    from google import genai
    client = genai.Client(api_key=api_key)

    # Load page 1 image
    if not document.pages:
        raise HTTPException(status_code=400, detail="Document has no pages.")

    first_page = document.pages[0]
    if not first_page.image_path or not Path(first_page.image_path).exists():
        raise HTTPException(status_code=404, detail="Page image not found on disk.")

    with Image.open(first_page.image_path) as img:
        page_image = img.convert("RGB")

    # Collect existing OCR regions for coordinate matching
    ocr_regions = db.query(OCRRegion).filter(OCRRegion.page_id == first_page.id).all()

    # Call Gemini Multimodal API with fallback models
    candidate_models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"]
    raw_text = None
    last_err = None

    for m_name in candidate_models:
        try:
            response = client.models.generate_content(
                model=m_name,
                contents=[EXTRACTION_PROMPT, page_image]
            )
            if response and response.text:
                raw_text = response.text.strip()
                break
        except Exception as e:
            last_err = e
            continue

    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API extraction failed: {str(last_err)}"
        )

    # Clean JSON fences if model returned them
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
    raw_text = raw_text.strip()

    try:
        data = json.loads(raw_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse JSON from LLM: {str(e)} | Output was: {raw_text[:200]}"
        )

    # Clear previous claims and their associated evidence/results for this document
    existing_claims = db.query(Claim).filter(Claim.document_id == document.id).all()
    if existing_claims:
        existing_claim_ids = [c.id for c in existing_claims]
        db.query(Evidence).filter(Evidence.claim_id.in_(existing_claim_ids)).delete(synchronize_session=False)
        db.query(VerificationResult).filter(VerificationResult.claim_id.in_(existing_claim_ids)).delete(synchronize_session=False)
        db.query(Claim).filter(Claim.document_id == document.id).delete(synchronize_session=False)

    created_claims: List[Claim] = []

    def add_claim(field: str, value: Any, data_type: str = "string"):
        if value is None or str(value).strip() == "":
            return
        str_val = str(value)
        bbox = find_matching_bbox(str_val, ocr_regions)
        claim = Claim(
            id=str(uuid.uuid4()),
            document_id=document.id,
            field=field,
            value=str_val,
            data_type=data_type,
            page_number=first_page.page_number,
            bbox=bbox,
            extraction_confidence=0.95,
            verification_status=VerificationStatus.UNVERIFIED,
        )
        db.add(claim)
        created_claims.append(claim)

    # 1. Document metadata claims
    add_claim("vendor_name", data.get("vendor_name"), "string")
    add_claim("vendor_address", data.get("vendor_address"), "string")
    add_claim("customer_name", data.get("customer_name"), "string")
    add_claim("invoice_number", data.get("invoice_number"), "string")
    add_claim("invoice_date", data.get("invoice_date"), "date")
    add_claim("due_date", data.get("due_date"), "date")
    add_claim("po_reference", data.get("purchase_order_number"), "string")
    add_claim("currency", data.get("currency"), "string")

    # 2. Financial totals claims
    if data.get("subtotal") is not None:
        add_claim("invoice_subtotal", data.get("subtotal"), "number")
    if data.get("tax_amount") is not None:
        add_claim("invoice_tax", data.get("tax_amount"), "number")
    if data.get("shipping_amount") is not None:
        add_claim("invoice_shipping", data.get("shipping_amount"), "number")
    if data.get("grand_total") is not None:
        add_claim("invoice_total", data.get("grand_total"), "number")

    # 3. Line items claims
    line_items = data.get("line_items", []) or []
    for idx, item in enumerate(line_items):
        item_prefix = f"item_{idx + 1}"
        if item.get("description"):
            add_claim(f"{item_prefix}_description", item.get("description"), "string")
        if item.get("quantity") is not None:
            add_claim(f"{item_prefix}_quantity", item.get("quantity"), "number")
        if item.get("unit_price") is not None:
            add_claim(f"{item_prefix}_unit_price", item.get("unit_price"), "currency")
        if item.get("total") is not None:
            add_claim(f"{item_prefix}_total", item.get("total"), "currency")

    # Audit log
    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        document_id=document.id,
        user_id=document.owner_id,
        action="CLAIMS_EXTRACTED",
        component="gemini_llm_service",
        log_metadata={
            "claims_count": len(created_claims),
            "line_items_count": len(line_items),
        }
    )
    db.add(audit_entry)

    db.commit()
    for c in created_claims:
        db.refresh(c)

    return created_claims
