from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Document, Evidence, Report, Claim
from app.schemas.verification import (
    FullVerificationResponse,
    EvidenceResponse,
    VerificationReportResponse,
    CrossDocumentVerificationRequest,
    CrossDocumentVerificationResponse,
    CrossDocumentEvidenceItem,
)
from app.services.verification_service import run_document_verification
from app.services.rule_engine import evaluate_cross_document_rules

router = APIRouter(prefix="/api/documents", tags=["Verification"])


@router.post("/{document_id}/verify", response_model=FullVerificationResponse)
def verify_document_endpoint(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Executes Phase 3.1 & 3.2 Verification on a document:
    Runs deterministic mathematical rules, temporal validity, and authority registry checks.
    Outputs tri-state decision (VERIFIED, REQUIRES_REVIEW, UNVERIFIABLE) and full evidence audit trail.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        result = run_document_verification(document=doc, db=db)
        return FullVerificationResponse(
            document_id=result["document_id"],
            decision=result["decision"],
            explanation=result["explanation"],
            total_checks=result["total_checks"],
            checks_passed=result["checks_passed"],
            checks_failed=result["checks_failed"],
            evidence=result["evidence"],
            report=result["report"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.get("/{document_id}/verification", response_model=FullVerificationResponse)
def get_document_verification_endpoint(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Fetches the latest verification results, evidence records, and decision for a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    claims = db.query(Claim).filter(Claim.document_id == document_id).all()
    evidence_list = db.query(Evidence).filter(
        Evidence.claim_id.in_([c.id for c in claims])
    ).all() if claims else []

    report = db.query(Report).filter(Report.document_id == document_id).order_by(Report.generated_at.desc()).first()

    passed = sum(1 for e in evidence_list if e.result == "PASS")
    failed = sum(1 for e in evidence_list if e.result in ("FAIL", "CONFLICT"))

    return FullVerificationResponse(
        document_id=doc.id,
        decision=doc.decision_status.value if doc.decision_status else "pending",
        explanation=report.explanation if report else None,
        total_checks=len(evidence_list),
        checks_passed=passed,
        checks_failed=failed,
        evidence=evidence_list,
        report=report,
    )


@router.post("/cross-document-verify", response_model=CrossDocumentVerificationResponse, tags=["Verification"])
def cross_document_verify_endpoint(
    payload: CrossDocumentVerificationRequest,
    db: Session = Depends(get_db),
):
    """
    Phase 4.2 Cross-Document Reconciliation:
    Compares claims extracted from a Purchase Order vs an Invoice using deterministic Python rules.
    Checks: Vendor Match, Quantity Overbill, Total Overbill.
    """
    po_doc = db.query(Document).filter(Document.id == payload.po_document_id).first()
    if not po_doc:
        raise HTTPException(status_code=404, detail=f"PO document not found: {payload.po_document_id}")

    inv_doc = db.query(Document).filter(Document.id == payload.invoice_document_id).first()
    if not inv_doc:
        raise HTTPException(status_code=404, detail=f"Invoice document not found: {payload.invoice_document_id}")

    po_claims = db.query(Claim).filter(Claim.document_id == payload.po_document_id).all()
    inv_claims = db.query(Claim).filter(Claim.document_id == payload.invoice_document_id).all()

    if not po_claims:
        raise HTTPException(status_code=400, detail="PO document has no extracted claims. Run claim extraction first.")
    if not inv_claims:
        raise HTTPException(status_code=400, detail="Invoice document has no extracted claims. Run claim extraction first.")

    cross_evals = evaluate_cross_document_rules(po_claims, inv_claims)

    passed = sum(1 for e in cross_evals if e.result == "PASS")
    failed = sum(1 for e in cross_evals if e.result in ("FAIL", "CONFLICT"))
    decision = "requires_review" if failed > 0 else ("verified" if passed > 0 else "unverifiable")

    if decision == "requires_review":
        failed_descs = [e.description for e in cross_evals if e.result in ("FAIL", "CONFLICT")]
        explanation = (
            f"Cross-document reconciliation flagged REQUIRES_HUMAN_REVIEW. "
            f"Detected {failed} discrepancy(ies):\n"
            + "\n".join([f"• {d}" for d in failed_descs])
        )
    elif decision == "verified":
        explanation = f"All {passed} cross-document reconciliation checks passed. Invoice is consistent with the authorized Purchase Order."
    else:
        explanation = "Insufficient claims extracted from PO or Invoice to perform cross-document reconciliation."

    evidence_items = [
        CrossDocumentEvidenceItem(
            rule_name=e.rule_name,
            result=e.result,
            description=e.description,
            authority_level=e.authority_level,
        )
        for e in cross_evals
    ]

    return CrossDocumentVerificationResponse(
        po_document_id=payload.po_document_id,
        invoice_document_id=payload.invoice_document_id,
        decision=decision,
        explanation=explanation,
        total_checks=len(cross_evals),
        checks_passed=passed,
        checks_failed=failed,
        evidence=evidence_items,
    )
