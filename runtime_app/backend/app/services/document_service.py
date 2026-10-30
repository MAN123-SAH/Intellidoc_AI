import os
import hashlib
import uuid
from pathlib import Path
from typing import Tuple, List, Optional
from PIL import Image
import pypdfium2 as pdfium
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Document, Page, AuditLog, User, DocumentType, ProcessingStatus

UPLOAD_ROOT = Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


def get_or_create_default_user(db: Session) -> User:
    """Returns the default developer/demo user for development mode."""
    user = db.query(User).filter(User.email == "demo@intellidoc.ai").first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email="demo@intellidoc.ai",
            full_name="Demo Analyst",
            hashed_password="not_used_in_demo",
            is_active=True,
            is_admin=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def calculate_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of raw document bytes."""
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    return hasher.hexdigest()


async def ingest_document(
    file: UploadFile,
    db: Session,
    user_id: Optional[str] = None
) -> Document:
    """
    Ingests an uploaded document (PDF/Image):
    1. Validates extension and file size.
    2. Computes cryptographic SHA-256 hash.
    3. Persists file to disk.
    4. Splits PDF into per-page PNG images.
    5. Saves Document and Page entries to PostgreSQL.
    6. Appends to Audit Log.
    """
    if not user_id:
        default_user = get_or_create_default_user(db)
        user_id = default_user.id

    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file_ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read content
    contents = await file.read()
    file_size = len(contents)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    file_hash = calculate_sha256(contents)

    # Check for duplicate
    existing_doc = db.query(Document).filter(Document.file_hash == file_hash).first()
    if existing_doc:
        return existing_doc

    doc_id = str(uuid.uuid4())
    doc_dir = UPLOAD_ROOT / doc_id
    doc_dir.mkdir(parents=True, exist_ok=True)

    saved_file_name = f"original{file_ext}"
    saved_file_path = doc_dir / saved_file_name

    with open(saved_file_path, "wb") as f:
        f.write(contents)

    # Detect document type heuristically or mark UNKNOWN
    detected_type = DocumentType.UNKNOWN
    type_conf = 0.0

    # Extract pages and dimensions
    pages_data: List[dict] = []

    if file_ext == ".pdf":
        try:
            pdf = pdfium.PdfDocument(contents)
            page_count = len(pdf)
            for page_idx in range(page_count):
                page = pdf[page_idx]
                width, height = int(page.get_width()), int(page.get_height())
                # Render to PIL image (at 150 DPI for fast preview / OCR)
                image = page.render(scale=150 / 72).to_pil()
                page_img_rel_path = f"page_{page_idx + 1}.png"
                image.save(doc_dir / page_img_rel_path, format="PNG")

                pages_data.append({
                    "page_number": page_idx + 1,
                    "image_path": str(doc_dir / page_img_rel_path),
                    "width": width,
                    "height": height
                })
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to process PDF pages: {str(e)}"
            )
    else:
        # Single image file (PNG / JPG)
        try:
            with Image.open(saved_file_path) as img:
                width, height = img.size
                page_img_rel_path = "page_1.png"
                img.save(doc_dir / page_img_rel_path, format="PNG")

                pages_data.append({
                    "page_number": 1,
                    "image_path": str(doc_dir / page_img_rel_path),
                    "width": width,
                    "height": height
                })
            page_count = 1
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to process image file: {str(e)}"
            )

    # Create Document record
    new_document = Document(
        id=doc_id,
        owner_id=user_id,
        filename=saved_file_name,
        original_filename=file.filename,
        file_path=str(saved_file_path),
        file_hash=file_hash,
        file_type=file_ext.lstrip("."),
        file_size_bytes=file_size,
        page_count=page_count,
        document_type=detected_type,
        type_confidence=type_conf,
        processing_status=ProcessingStatus.PENDING,
    )
    db.add(new_document)

    # Create Page records
    for pdata in pages_data:
        page_record = Page(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            page_number=pdata["page_number"],
            image_path=pdata["image_path"],
            width=pdata["width"],
            height=pdata["height"],
        )
        db.add(page_record)

    # Add audit log entry
    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        user_id=user_id,
        action="DOCUMENT_UPLOADED",
        component="document_service",
        log_metadata={
            "original_filename": file.filename,
            "page_count": page_count,
            "file_size_bytes": file_size,
            "file_hash": file_hash,
        }
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(new_document)

    return new_document
