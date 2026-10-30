from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Document, Claim
from app.schemas.claim import ClaimResponse, ClaimListResponse, ClaimExtractionResponse
from app.services.llm_extraction_service import extract_claims_with_gemini

router = APIRouter(prefix="/api/documents", tags=["Claims"])


@router.post("/{document_id}/extract-claims", response_model=ClaimExtractionResponse, status_code=status.HTTP_201_CREATED)
def extract_claims_endpoint(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Extracts structured factual claims from a document using Gemini API.
    Saves each extracted field (vendor, total, line items) as a first-class Claim in PostgreSQL.
    """
    doc = db.query(Document).options(joinedload(Document.pages)).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    claims = extract_claims_with_gemini(document=doc, db=db)

    return ClaimExtractionResponse(
        message=f"Successfully extracted {len(claims)} claims from document.",
        document_id=doc.id,
        claims_count=len(claims),
        claims=claims
    )


@router.get("/{document_id}/claims", response_model=ClaimListResponse)
def get_document_claims(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Fetches all extracted claims for a document."""
    claims = db.query(Claim).filter(Claim.document_id == document_id).order_by(Claim.field).all()
    return ClaimListResponse(
        total=len(claims),
        claims=claims
    )
