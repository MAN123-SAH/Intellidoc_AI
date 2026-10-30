"""
IntelliDoc AI — Database Models
All SQLAlchemy ORM table definitions.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, JSON, String, Text, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


# ─────────────────────────────────────────────────────────────
# Enumerations
# ─────────────────────────────────────────────────────────────

class DocumentType(str, enum.Enum):
    INVOICE          = "invoice"
    CERTIFICATE      = "certificate"
    PURCHASE_ORDER   = "purchase_order"
    UNKNOWN          = "unknown"


class ProcessingStatus(str, enum.Enum):
    PENDING     = "pending"
    PROCESSING  = "processing"
    COMPLETED   = "completed"
    FAILED      = "failed"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED       = "unverified"
    VERIFIED         = "verified"
    CONFLICT         = "conflict"
    UNVERIFIABLE     = "unverifiable"
    REQUIRES_REVIEW  = "requires_review"


class DecisionStatus(str, enum.Enum):
    VERIFIED         = "verified"
    REQUIRES_REVIEW  = "requires_review"
    UNVERIFIABLE     = "unverifiable"


class EvidenceType(str, enum.Enum):
    RULE             = "rule"
    CROSS_DOCUMENT   = "cross_document"
    FORENSIC         = "forensic"
    EXTERNAL_SOURCE  = "external_source"
    OCR              = "ocr"
    LAYOUT           = "layout"
    LLM_INTERPRETATION = "llm_interpretation"


class ReviewDecision(str, enum.Enum):
    APPROVED    = "approved"
    REJECTED    = "rejected"
    UNRESOLVED  = "unresolved"


class RelationshipType(str, enum.Enum):
    PO_INVOICE      = "po_invoice"
    RELATED         = "related"


# ─────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────

def generate_uuid():
    return str(uuid.uuid4())


# ─────────────────────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    full_name     = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active     = Column(Boolean, default=True)
    is_admin      = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents     = relationship("Document", back_populates="owner")
    audit_logs    = relationship("AuditLog", back_populates="user")
    review_cases  = relationship("ReviewCase", back_populates="reviewer")


# ─────────────────────────────────────────────────────────────
# Documents
# ─────────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id                 = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    owner_id           = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    filename           = Column(String(500), nullable=False)
    original_filename  = Column(String(500), nullable=False)
    file_path          = Column(String(1000), nullable=False)
    file_hash          = Column(String(64), nullable=False)          # SHA-256
    file_type          = Column(String(10), nullable=False)          # pdf, png, jpg
    file_size_bytes    = Column(Integer, nullable=False)
    page_count         = Column(Integer, default=1)
    document_type      = Column(Enum(DocumentType), default=DocumentType.UNKNOWN)
    type_confidence    = Column(Float, default=0.0)
    processing_status  = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    decision_status    = Column(Enum(DecisionStatus), nullable=True)
    uploaded_at        = Column(DateTime, default=datetime.utcnow)
    processed_at       = Column(DateTime, nullable=True)
    error_message      = Column(Text, nullable=True)

    # Relationships
    owner              = relationship("User", back_populates="documents")
    pages              = relationship("Page", back_populates="document", cascade="all, delete-orphan")
    claims             = relationship("Claim", back_populates="document", cascade="all, delete-orphan")
    verification_tasks = relationship("VerificationTask", back_populates="document", cascade="all, delete-orphan")
    reports            = relationship("Report", back_populates="document", cascade="all, delete-orphan")
    audit_logs         = relationship("AuditLog", back_populates="document")
    review_cases       = relationship("ReviewCase", back_populates="document")

    # Cross-document relationships
    relationships_as_source = relationship(
        "DocumentRelationship",
        foreign_keys="DocumentRelationship.source_document_id",
        back_populates="source_document"
    )
    relationships_as_target = relationship(
        "DocumentRelationship",
        foreign_keys="DocumentRelationship.target_document_id",
        back_populates="target_document"
    )


# ─────────────────────────────────────────────────────────────
# Pages
# ─────────────────────────────────────────────────────────────

class Page(Base):
    __tablename__ = "pages"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id   = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    page_number   = Column(Integer, nullable=False)
    image_path    = Column(String(1000), nullable=True)   # stored page image
    width         = Column(Integer, nullable=True)
    height        = Column(Integer, nullable=True)

    # Relationships
    document      = relationship("Document", back_populates="pages")
    ocr_regions   = relationship("OCRRegion", back_populates="page", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("document_id", "page_number"),)


# ─────────────────────────────────────────────────────────────
# OCR Regions
# ─────────────────────────────────────────────────────────────

class OCRRegion(Base):
    __tablename__ = "ocr_regions"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    page_id         = Column(UUID(as_uuid=False), ForeignKey("pages.id"), nullable=False)
    text            = Column(Text, nullable=False)
    bbox            = Column(JSON, nullable=False)       # [x0, y0, x1, y1]
    ocr_confidence  = Column(Float, default=0.0)
    layout_label    = Column(String(50), nullable=True)  # header, table, paragraph, etc.
    reading_order   = Column(Integer, nullable=True)

    # Relationships
    page            = relationship("Page", back_populates="ocr_regions")


# ─────────────────────────────────────────────────────────────
# Claims  — the core entity of IntelliDoc
# ─────────────────────────────────────────────────────────────

class Claim(Base):
    __tablename__ = "claims"

    id                      = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id             = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    field                   = Column(String(100), nullable=False)    # e.g. "invoice_quantity"
    value                   = Column(Text, nullable=False)            # e.g. "120"
    data_type               = Column(String(20), default="string")   # number, string, date, currency
    page_number             = Column(Integer, nullable=True)
    bbox                    = Column(JSON, nullable=True)             # [x0, y0, x1, y1]
    extraction_confidence   = Column(Float, default=0.0)
    verification_status     = Column(Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    extracted_at            = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document                = relationship("Document", back_populates="claims")
    evidence                = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")
    verification_results    = relationship("VerificationResult", back_populates="claim", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
# Verification Tasks
# ─────────────────────────────────────────────────────────────

class VerificationTask(Base):
    __tablename__ = "verification_tasks"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id   = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    check_type    = Column(String(100), nullable=False)  # arithmetic_check, po_quantity_check, etc.
    status        = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    created_at    = Column(DateTime, default=datetime.utcnow)
    completed_at  = Column(DateTime, nullable=True)

    # Relationships
    document      = relationship("Document", back_populates="verification_tasks")
    results       = relationship("VerificationResult", back_populates="task", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
# Evidence
# ─────────────────────────────────────────────────────────────

class Evidence(Base):
    __tablename__ = "evidence"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    claim_id        = Column(UUID(as_uuid=False), ForeignKey("claims.id"), nullable=False)
    evidence_type   = Column(Enum(EvidenceType), nullable=False)
    source          = Column(String(255), nullable=True)      # e.g. "PO-001", "registry", "rule_engine"
    result          = Column(String(20), nullable=False)       # PASS, FAIL, CONFLICT, UNAVAILABLE
    description     = Column(Text, nullable=False)
    raw_data        = Column(JSON, nullable=True)              # full evidence payload
    page_number     = Column(Integer, nullable=True)
    bbox            = Column(JSON, nullable=True)
    authority_level = Column(String(20), default="supporting") # authoritative, supporting, indicative
    created_at      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    claim           = relationship("Claim", back_populates="evidence")


# ─────────────────────────────────────────────────────────────
# Verification Results
# ─────────────────────────────────────────────────────────────

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id          = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    task_id     = Column(UUID(as_uuid=False), ForeignKey("verification_tasks.id"), nullable=False)
    claim_id    = Column(UUID(as_uuid=False), ForeignKey("claims.id"), nullable=False)
    result      = Column(String(20), nullable=False)    # PASS, FAIL, CONFLICT, UNAVAILABLE
    reason      = Column(Text, nullable=True)
    details     = Column(JSON, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    # Relationships
    task        = relationship("VerificationTask", back_populates="results")
    claim       = relationship("Claim", back_populates="verification_results")


# ─────────────────────────────────────────────────────────────
# Reports
# ─────────────────────────────────────────────────────────────

class Report(Base):
    __tablename__ = "reports"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id     = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    decision        = Column(Enum(DecisionStatus), nullable=False)
    explanation     = Column(Text, nullable=True)       # LLM-generated explanation
    html_path       = Column(String(1000), nullable=True)
    pdf_path        = Column(String(1000), nullable=True)
    summary_data    = Column(JSON, nullable=True)       # structured summary for frontend
    generated_at    = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document        = relationship("Document", back_populates="reports")


# ─────────────────────────────────────────────────────────────
# Review Cases
# ─────────────────────────────────────────────────────────────

class ReviewCase(Base):
    __tablename__ = "review_cases"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id     = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    reviewer_id     = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    reason          = Column(Text, nullable=False)
    decision        = Column(Enum(ReviewDecision), nullable=True)
    comment         = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    resolved_at     = Column(DateTime, nullable=True)

    # Relationships
    document        = relationship("Document", back_populates="review_cases")
    reviewer        = relationship("User", back_populates="review_cases")


# ─────────────────────────────────────────────────────────────
# Document Relationships  (PO ↔ Invoice etc.)
# ─────────────────────────────────────────────────────────────

class DocumentRelationship(Base):
    __tablename__ = "document_relationships"

    id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    source_document_id   = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    target_document_id   = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    relationship_type    = Column(Enum(RelationshipType), nullable=False)
    created_at           = Column(DateTime, default=datetime.utcnow)

    # Relationships
    source_document      = relationship("Document", foreign_keys=[source_document_id],
                                        back_populates="relationships_as_source")
    target_document      = relationship("Document", foreign_keys=[target_document_id],
                                        back_populates="relationships_as_target")


# ─────────────────────────────────────────────────────────────
# External Sources  (Authority Registry)
# ─────────────────────────────────────────────────────────────

class ExternalSource(Base):
    __tablename__ = "external_sources"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    source_type     = Column(String(50), nullable=False)   # certificate_registry, vendor_registry
    record_id       = Column(String(255), nullable=False)  # e.g. CERT123
    record_data     = Column(JSON, nullable=False)         # the actual registry record
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("source_type", "record_id"),)


# ─────────────────────────────────────────────────────────────
# Audit Logs  (immutable)
# ─────────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id           = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    document_id  = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=True)
    user_id      = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    action       = Column(String(100), nullable=False)   # document_uploaded, claim_created, etc.
    component    = Column(String(100), nullable=True)    # ocr_service, rule_engine, etc.
    log_metadata = Column("metadata", JSON, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document     = relationship("Document", back_populates="audit_logs")
    user         = relationship("User", back_populates="audit_logs")
