from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class EvidenceResponse(BaseModel):
    id: str
    claim_id: Optional[str] = None
    evidence_type: str
    source: Optional[str] = None
    result: str  # PASS, FAIL, CONFLICT, UNAVAILABLE
    description: str
    authority_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationResultResponse(BaseModel):
    id: str
    task_id: str
    claim_id: str
    result: str
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationTaskResponse(BaseModel):
    id: str
    document_id: str
    check_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    results: List[VerificationResultResponse] = []

    class Config:
        from_attributes = True


class VerificationReportResponse(BaseModel):
    id: str
    document_id: str
    decision: str  # verified, requires_review, unverifiable
    explanation: Optional[str] = None
    summary_data: Optional[Dict[str, Any]] = None
    generated_at: datetime

    class Config:
        from_attributes = True


class FullVerificationResponse(BaseModel):
    document_id: str
    decision: str
    explanation: Optional[str] = None
    total_checks: int
    checks_passed: int
    checks_failed: int
    evidence: List[EvidenceResponse]
    report: Optional[VerificationReportResponse] = None


class CrossDocumentEvidenceItem(BaseModel):
    rule_name: str
    result: str  # PASS, FAIL, CONFLICT, UNAVAILABLE
    description: str
    authority_level: str


class CrossDocumentVerificationRequest(BaseModel):
    po_document_id: str
    invoice_document_id: str


class CrossDocumentVerificationResponse(BaseModel):
    po_document_id: str
    invoice_document_id: str
    decision: str
    explanation: str
    total_checks: int
    checks_passed: int
    checks_failed: int
    evidence: List[CrossDocumentEvidenceItem]
