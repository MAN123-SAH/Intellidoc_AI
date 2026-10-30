from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


class ClaimResponse(BaseModel):
    id: str
    document_id: str
    field: str
    value: str
    data_type: str
    page_number: Optional[int] = None
    bbox: Optional[List[int]] = None
    extraction_confidence: float
    verification_status: str
    extracted_at: datetime

    class Config:
        from_attributes = True


class ClaimListResponse(BaseModel):
    total: int
    claims: List[ClaimResponse]


class ClaimExtractionResponse(BaseModel):
    message: str
    document_id: str
    claims_count: int
    claims: List[ClaimResponse]
