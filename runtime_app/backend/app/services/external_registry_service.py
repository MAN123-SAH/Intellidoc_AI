import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.models import ExternalSource, Claim
from app.services.rule_engine import RuleEvaluationResult


SEED_VENDORS = [
    {
        "record_id": "VEND-001",
        "name": "Saldo Apps",
        "tax_id": "US-SALDO-0206",
        "address": "First str., 28-32, Chicago, USA",
        "country": "USA",
        "status": "ACTIVE",
        "certified_until": "2028-12-31"
    },
    {
        "record_id": "VEND-002",
        "name": "Acme Industrial Supplies",
        "tax_id": "US-ACME-9912",
        "address": "100 Industrial Parkway, Detroit, USA",
        "country": "USA",
        "status": "ACTIVE",
        "certified_until": "2027-06-30"
    },
    {
        "record_id": "VEND-003",
        "name": "Global Tech Logistics",
        "tax_id": "DE-GTL-4411",
        "address": "Alexanderplatz 4, Berlin, Germany",
        "country": "Germany",
        "status": "SUSPENDED",
        "certified_until": "2024-01-01"
    }
]


def seed_external_registry(db: Session):
    """Populates the external_sources table with official registry records if empty."""
    existing_count = db.query(ExternalSource).filter(ExternalSource.source_type == "vendor_registry").count()
    if existing_count == 0:
        for v in SEED_VENDORS:
            entry = ExternalSource(
                id=str(uuid.uuid4()),
                source_type="vendor_registry",
                record_id=v["record_id"],
                record_data=v,
                is_active=(v["status"] == "ACTIVE")
            )
            db.add(entry)
        db.commit()


def verify_vendor_registry(claims: List[Claim], db: Session) -> RuleEvaluationResult:
    """Verifies whether the claimed vendor exists in the official authority registry."""
    seed_external_registry(db)

    vendor_claim = next((c for c in claims if c.field == "vendor_name"), None)
    if not vendor_claim:
        return RuleEvaluationResult(
            rule_name="EXTERNAL_VENDOR_REGISTRY",
            result="UNAVAILABLE",
            description="No vendor_name claim present to check against Authority Registry.",
            authority_level="authoritative"
        )

    claimed_vendor_name = vendor_claim.value.strip().lower()

    # Query registry records
    records = db.query(ExternalSource).filter(ExternalSource.source_type == "vendor_registry").all()

    matched_record = None
    for rec in records:
        reg_name = rec.record_data.get("name", "").strip().lower()
        if claimed_vendor_name in reg_name or reg_name in claimed_vendor_name:
            matched_record = rec
            break

    if matched_record:
        if matched_record.is_active:
            return RuleEvaluationResult(
                rule_name="EXTERNAL_VENDOR_REGISTRY",
                result="PASS",
                description=f"Vendor '{vendor_claim.value}' verified in Authority Registry (Record: {matched_record.record_id}, Status: ACTIVE).",
                claim_id=vendor_claim.id,
                authority_level="authoritative",
                raw_data=matched_record.record_data
            )
        else:
            return RuleEvaluationResult(
                rule_name="EXTERNAL_VENDOR_REGISTRY",
                result="FAIL",
                description=f"Vendor '{vendor_claim.value}' found in Authority Registry but is flagged as SUSPENDED/INACTIVE.",
                claim_id=vendor_claim.id,
                authority_level="authoritative",
                raw_data=matched_record.record_data
            )
    else:
        return RuleEvaluationResult(
            rule_name="EXTERNAL_VENDOR_REGISTRY",
            result="CONFLICT",
            description=f"Vendor '{vendor_claim.value}' not found in official Authority Registry.",
            claim_id=vendor_claim.id,
            authority_level="supporting"
        )
