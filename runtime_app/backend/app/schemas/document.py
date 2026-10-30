from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────
# OCR & Layout Schemas
# ─────────────────────────────────────────────────────────────

class OCRRegionResponse(BaseModel):
    id: str
    page_id: str
    text: str
    bbox: List[int]
    ocr_confidence: float
    layout_label: Optional[str] = None
    reading_order: Optional[int] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Page Schemas
# ─────────────────────────────────────────────────────────────

class PageResponse(BaseModel):
    id: str
    page_number: int
    image_path: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    ocr_regions: List[OCRRegionResponse] = []

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Document Schemas
# ─────────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: str
    owner_id: str
    filename: str
    original_filename: str
    file_path: str
    file_hash: str
    file_type: str
    file_size_bytes: int
    page_count: int
    document_type: str
    type_confidence: float
    processing_status: str
    decision_status: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    pages: List[PageResponse] = []

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    total: int
    documents: List[DocumentResponse]


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse
