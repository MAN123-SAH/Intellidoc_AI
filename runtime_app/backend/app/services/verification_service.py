import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import (
    Document,
    Claim,
    Evidence,
    VerificationTask,
    VerificationResult,
    Report,
    AuditLog,
    DecisionStatus,
    EvidenceType,
    ProcessingStatus,
    VerificationStatus,
)
from app.services.rule_engine import evaluate_deterministic_rules, RuleEvaluationResult
from app.services.external_registry_service import verify_vendor_registry


def run_document_verification(document: Document, db: Session) -> Dict[str, Any]:
    """
    Executes the Complete Verification Pipeline:
    1. Evaluates Deterministic Python Rules (Arithmetic + Chronology).
    2. Queries External Authority Registry (Vendor verification).
    3. Synthesizes Evidence into PostgreSQL.
    4. Applies Tri-State Decision Policy (VERIFIED, REQUIRES_REVIEW, UNVERIFIABLE).
    5. Generates Explainable Audit Report.
    """
    claims = db.query(Claim).filter(Claim.document_id == document.id).all()
    if not claims:
        raise ValueError("Cannot verify document with 0 extracted claims. Run claim extraction first.")

    # 1. Create overarching Verification Task
    task = VerificationTask(
        id=str(uuid.uuid4()),
        document_id=document.id,
        check_type="comprehensive_evidence_verification",
        status=ProcessingStatus.PROCESSING,
        created_at=datetime.utcnow()
    )
    db.add(task)
    db.flush()

    # Clear prior evidence, results, reports for this document
    db.query(Evidence).filter(
        Evidence.claim_id.in_([c.id for c in claims])
    ).delete(synchronize_session=False)
    db.query(Report).filter(Report.document_id == document.id).delete()

    # 2. Run Deterministic Python Rules
    rule_results: List[RuleEvaluationResult] = evaluate_deterministic_rules(claims)

    # 3. Run External Authority Registry Checks
    registry_result: RuleEvaluationResult = verify_vendor_registry(claims, db)
    all_results = rule_results + [registry_result]

    evidence_records: List[Evidence] = []
    failed_reasons: List[str] = []
    passed_checks = 0
    failed_checks = 0

    # 4. Populate Evidence and Results
    for res in all_results:
        ev_type = (
            EvidenceType.EXTERNAL_SOURCE
            if res.rule_name == "EXTERNAL_VENDOR_REGISTRY"
            else EvidenceType.RULE
        )

        ev = Evidence(
            id=str(uuid.uuid4()),
            claim_id=res.claim_id or claims[0].id,
            evidence_type=ev_type,
            source=res.rule_name,
            result=res.result,
            description=res.description,
            authority_level=res.authority_level,
            raw_data=res.raw_data,
            created_at=datetime.utcnow()
        )
        db.add(ev)
        evidence_records.append(ev)

        # Verification result per task
        v_res = VerificationResult(
            id=str(uuid.uuid4()),
            task_id=task.id,
            claim_id=res.claim_id or claims[0].id,
            result=res.result,
            reason=res.description,
            details=res.raw_data,
            created_at=datetime.utcnow()
        )
        db.add(v_res)

        # Update claim status
        if res.claim_id:
            target_claim = next((c for c in claims if c.id == res.claim_id), None)
            if target_claim:
                if res.result == "FAIL":
                    target_claim.verification_status = VerificationStatus.CONFLICT
                elif res.result == "PASS" and target_claim.verification_status != VerificationStatus.CONFLICT:
                    target_claim.verification_status = VerificationStatus.VERIFIED

        if res.result in ("FAIL", "CONFLICT"):
            failed_checks += 1
            failed_reasons.append(res.description)
        elif res.result == "PASS":
            passed_checks += 1

    # 5. Tri-State Decision Policy
    if failed_checks > 0:
        decision = DecisionStatus.REQUIRES_REVIEW
    elif passed_checks > 0 and failed_checks == 0:
        decision = DecisionStatus.VERIFIED
    else:
        decision = DecisionStatus.UNVERIFIABLE

    # 6. Generate Explainable Audit Narrative
    if decision == DecisionStatus.REQUIRES_REVIEW:
        explanation = (
            f"The verification engine flagged this document as REQUIRES_HUMAN_REVIEW. "
            f"Detected {failed_checks} discrepancy(ies):\n"
            + "\n".join([f"• {r}" for r in failed_reasons])
        )
    elif decision == DecisionStatus.VERIFIED:
        explanation = (
            f"The document has been successfully VERIFIED. All {passed_checks} mathematical, "
            f"temporal, and authority registry checks passed with 100% consistency."
        )
    else:
        explanation = "The document is UNVERIFIABLE due to insufficient verifiable claims."

    # 7. Create Official Report
    report = Report(
        id=str(uuid.uuid4()),
        document_id=document.id,
        decision=decision,
        explanation=explanation,
        summary_data={
            "total_checks": len(all_results),
            "checks_passed": passed_checks,
            "checks_failed": failed_checks,
            "decision": decision.value,
        },
        generated_at=datetime.utcnow()
    )
    db.add(report)

    # Finalize task and document status
    task.status = ProcessingStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    document.decision_status = decision

    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        document_id=document.id,
        user_id=document.owner_id,
        action="DOCUMENT_VERIFIED",
        component="verification_engine",
        log_metadata={
            "decision": decision.value,
            "checks_passed": passed_checks,
            "checks_failed": failed_checks,
        }
    )
    db.add(audit_entry)

    db.commit()

    return {
        "document_id": document.id,
        "decision": decision.value,
        "explanation": explanation,
        "total_checks": len(all_results),
        "checks_passed": passed_checks,
        "checks_failed": failed_checks,
        "evidence": evidence_records,
        "report": report,
    }
