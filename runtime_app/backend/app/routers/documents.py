import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Document, Page, OCRRegion, ProcessingStatus, AuditLog
from app.schemas.document import DocumentResponse, DocumentListResponse, DocumentUploadResponse, OCRRegionResponse
from app.services.document_service import ingest_document
from app.services.ocr_service import run_ocr_on_image
from app.services.layout_service import classify_document_layout

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document (PDF, PNG, JPG).
    Stores file, calculates SHA-256 hash, extracts page images, and records in database.
    """
    document = await ingest_document(file=file, db=db)
    # Reload with pages
    doc = db.query(Document).options(joinedload(Document.pages)).filter(Document.id == document.id).first()
    return DocumentUploadResponse(
        message="Document uploaded and ingested successfully.",
        document=doc
    )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lists all uploaded documents with pagination."""
    query = db.query(Document).options(
        joinedload(Document.pages).joinedload(Page.ocr_regions)
    ).order_by(Document.uploaded_at.desc())
    total = query.count()
    docs = query.offset(skip).limit(limit).all()
    return DocumentListResponse(total=total, documents=docs)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Fetches details and page metadata for a single document."""
    doc = db.query(Document).options(
        joinedload(Document.pages).joinedload(Page.ocr_regions)
    ).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/pages/{page_number}/image")
def get_page_image(
    document_id: str,
    page_number: int,
    db: Session = Depends(get_db)
):
    """Streams the rendered PNG image for a specific page of a document."""
    page = db.query(Page).filter(
        Page.document_id == document_id,
        Page.page_number == page_number
    ).first()

    if not page or not page.image_path or not Path(page.image_path).exists():
        raise HTTPException(status_code=404, detail="Page image not found")

    return FileResponse(page.image_path, media_type="image/png")


@router.get("/{document_id}/pages/{page_number}/regions", response_model=List[OCRRegionResponse])
def get_page_regions(
    document_id: str,
    page_number: int,
    db: Session = Depends(get_db)
):
    """Returns detected OCR words and LayoutLMv3 semantic bounding boxes for a page."""
    page = db.query(Page).filter(
        Page.document_id == document_id,
        Page.page_number == page_number
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    regions = db.query(OCRRegion).filter(OCRRegion.page_id == page.id).order_by(OCRRegion.reading_order).all()
    return regions


@router.post("/{document_id}/process", response_model=DocumentResponse)
def process_document_perception(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Executes the Phase 2.2 Multimodal Perception Pipeline:
    1. Tesseract OCR: extracts word tokens & pixel bounding boxes.
    2. Fine-Tuned LayoutLMv3: classifies semantic layout tags (header, question, answer, other).
    3. Persists results to `ocr_regions` in PostgreSQL.
    """
    doc = db.query(Document).options(joinedload(Document.pages)).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.processing_status = ProcessingStatus.PROCESSING
    db.commit()

    total_regions_created = 0

    try:
        for page in doc.pages:
            if not page.image_path or not Path(page.image_path).exists():
                continue

            # 1. Run OCR (Tesseract)
            tokens, width, height = run_ocr_on_image(page.image_path)
            page.width = width
            page.height = height

            # 2. Run LayoutLMv3 Inference
            annotated_tokens = classify_document_layout(page.image_path, tokens)

            # 3. Clear existing regions for this page (if re-processing)
            db.query(OCRRegion).filter(OCRRegion.page_id == page.id).delete()

            # 4. Save new OCRRegions
            for idx, token in enumerate(annotated_tokens):
                region = OCRRegion(
                    id=str(uuid.uuid4()),
                    page_id=page.id,
                    text=token["text"],
                    bbox=token["bbox"],
                    ocr_confidence=token["confidence"],
                    layout_label=token.get("layout_label", "other"),
                    reading_order=idx,
                )
                db.add(region)
                total_regions_created += 1

        doc.processing_status = ProcessingStatus.COMPLETED
        doc.processed_at = datetime.utcnow()

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            user_id=doc.owner_id,
            action="PERCEPTION_PIPELINE_COMPLETED",
            component="layoutlmv3_service",
            log_metadata={
                "regions_detected": total_regions_created,
                "pages_processed": len(doc.pages),
            }
        )
        db.add(audit_entry)
        db.commit()

    except Exception as e:
        db.rollback()
        doc.processing_status = ProcessingStatus.FAILED
        doc.error_message = str(e)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Perception pipeline failed: {str(e)}"
        )

    # Return refreshed document with pages and regions
    refreshed_doc = db.query(Document).options(
        joinedload(Document.pages).joinedload(Page.ocr_regions)
    ).filter(Document.id == document_id).first()

    return refreshed_doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Deletes a document and its associated records."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    return None
