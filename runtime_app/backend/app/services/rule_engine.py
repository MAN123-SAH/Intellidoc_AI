import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from dateutil import parser as date_parser

from app.models.models import Claim, EvidenceType


def clean_number(value_str: Optional[str]) -> Optional[float]:
    """Extracts a clean float number from a currency or formatted string."""
    if value_str is None:
        return None
    cleaned = re.sub(r"[^\d.-]", "", str(value_str))
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parses standard human or ISO date strings into datetime objects."""
    if not date_str:
        return None
    try:
        # fuzzy parse handles "Jul 13th, 2021", "2021-07-13", etc.
        return date_parser.parse(str(date_str), fuzzy=True)
    except Exception:
        return None


class RuleEvaluationResult:
    def __init__(
        self,
        rule_name: str,
        result: str,  # PASS, FAIL, CONFLICT, UNAVAILABLE
        description: str,
        claim_id: Optional[str] = None,
        authority_level: str = "authoritative",
        raw_data: Optional[Dict[str, Any]] = None,
    ):
        self.rule_name = rule_name
        self.result = result
        self.description = description
        self.claim_id = claim_id
        self.authority_level = authority_level
        self.raw_data = raw_data or {}


def evaluate_deterministic_rules(claims: List[Claim]) -> List[RuleEvaluationResult]:
    """
    Executes pure deterministic Python validation rules against extracted claims.
    STRICT SAFETY RULE: All arithmetic and temporal validations are performed by Python code,
    never delegating mathematical calculations to an LLM.
    """
    claim_dict: Dict[str, Claim] = {c.field: c for c in claims}
    evaluations: List[RuleEvaluationResult] = []

    # ─────────────────────────────────────────────────────────
    # RULE 1: Grand Total Arithmetic Consistency
    # subtotal + tax + shipping == grand_total
    # ─────────────────────────────────────────────────────────
    total_claim = claim_dict.get("invoice_total")
    subtotal_claim = claim_dict.get("invoice_subtotal")
    tax_claim = claim_dict.get("invoice_tax")
    shipping_claim = claim_dict.get("invoice_shipping")

    if total_claim and subtotal_claim:
        subtotal_val = clean_number(subtotal_claim.value) or 0.0
        tax_val = clean_number(tax_claim.value) if tax_claim else 0.0
        shipping_val = clean_number(shipping_claim.value) if shipping_claim else 0.0
        claimed_total = clean_number(total_claim.value)

        if claimed_total is not None:
            expected_total = round(subtotal_val + tax_val + shipping_val, 2)
            claimed_rounded = round(claimed_total, 2)
            diff = round(abs(expected_total - claimed_rounded), 2)

            if diff <= 0.05:  # $0.05 tolerance for rounding
                evaluations.append(RuleEvaluationResult(
                    rule_name="ARITHMETIC_TOTAL_CONSISTENCY",
                    result="PASS",
                    description=f"Grand total matches sum: Subtotal ({subtotal_val}) + Tax ({tax_val}) + Shipping ({shipping_val}) = {claimed_rounded}.",
                    claim_id=total_claim.id,
                    authority_level="authoritative",
                    raw_data={"expected": expected_total, "claimed": claimed_rounded, "difference": diff}
                ))
            else:
                evaluations.append(RuleEvaluationResult(
                    rule_name="ARITHMETIC_TOTAL_CONSISTENCY",
                    result="FAIL",
                    description=f"Arithmetic mismatch: Subtotal ({subtotal_val}) + Tax ({tax_val}) + Shipping ({shipping_val}) = {expected_total}, but document claims {claimed_rounded} (Difference: ${diff:.2f}).",
                    claim_id=total_claim.id,
                    authority_level="authoritative",
                    raw_data={"expected": expected_total, "claimed": claimed_rounded, "difference": diff}
                ))
    else:
        evaluations.append(RuleEvaluationResult(
            rule_name="ARITHMETIC_TOTAL_CONSISTENCY",
            result="UNAVAILABLE",
            description="Insufficient financial claims (Subtotal or Total missing) to verify grand total sum.",
            authority_level="supporting"
        ))

    # ─────────────────────────────────────────────────────────
    # RULE 2: Line Item Product Arithmetic
    # quantity * unit_price == line_total
    # ─────────────────────────────────────────────────────────
    # Identify how many line items exist in claims
    item_indices = set()
    for field in claim_dict.keys():
        m = re.match(r"item_(\d+)_", field)
        if m:
            item_indices.add(int(m.group(1)))

    for idx in sorted(item_indices):
        prefix = f"item_{idx}"
        qty_claim = claim_dict.get(f"{prefix}_quantity")
        price_claim = claim_dict.get(f"{prefix}_unit_price")
        total_item_claim = claim_dict.get(f"{prefix}_total")

        if qty_claim and price_claim and total_item_claim:
            q = clean_number(qty_claim.value)
            p = clean_number(price_claim.value)
            t = clean_number(total_item_claim.value)

            if q is not None and p is not None and t is not None:
                expected_line_total = round(q * p, 2)
                claimed_line_total = round(t, 2)
                diff = round(abs(expected_line_total - claimed_line_total), 2)

                if diff <= 0.05:
                    evaluations.append(RuleEvaluationResult(
                        rule_name=f"LINE_ITEM_{idx}_ARITHMETIC",
                        result="PASS",
                        description=f"Line item {idx} calculation valid: Qty ({q}) × Price ({p}) = {claimed_line_total}.",
                        claim_id=total_item_claim.id,
                        authority_level="authoritative",
                    ))
                else:
                    evaluations.append(RuleEvaluationResult(
                        rule_name=f"LINE_ITEM_{idx}_ARITHMETIC",
                        result="FAIL",
                        description=f"Line item {idx} mismatch: Qty ({q}) × Price ({p}) = {expected_line_total}, but line total claims {claimed_line_total}.",
                        claim_id=total_item_claim.id,
                        authority_level="authoritative",
                        raw_data={"expected": expected_line_total, "claimed": claimed_line_total}
                    ))

    # ─────────────────────────────────────────────────────────
    # RULE 3: Chronological Date Validity
    # invoice_date <= due_date
    # ─────────────────────────────────────────────────────────
    inv_date_claim = claim_dict.get("invoice_date")
    due_date_claim = claim_dict.get("due_date")

    if inv_date_claim and due_date_claim:
        inv_dt = parse_date(inv_date_claim.value)
        due_dt = parse_date(due_date_claim.value)

        if inv_dt and due_dt:
            if due_dt >= inv_dt:
                evaluations.append(RuleEvaluationResult(
                    rule_name="TEMPORAL_CHRONOLOGY",
                    result="PASS",
                    description=f"Date chronology valid: Due date ({due_dt.strftime('%Y-%m-%d')}) is on or after invoice issue date ({inv_dt.strftime('%Y-%m-%d')}).",
                    claim_id=due_date_claim.id,
                    authority_level="authoritative",
                ))
            else:
                evaluations.append(RuleEvaluationResult(
                    rule_name="TEMPORAL_CHRONOLOGY",
                    result="FAIL",
                    description=f"Temporal anomaly detected: Due date ({due_dt.strftime('%Y-%m-%d')}) precedes invoice issue date ({inv_dt.strftime('%Y-%m-%d')}).",
                    claim_id=due_date_claim.id,
                    authority_level="authoritative",
                    raw_data={"invoice_date": inv_dt.isoformat(), "due_date": due_dt.isoformat()}
                ))
        else:
            evaluations.append(RuleEvaluationResult(
                rule_name="TEMPORAL_CHRONOLOGY",
                result="UNAVAILABLE",
                description="Failed to parse date format into standard timestamp.",
                authority_level="supporting"
            ))

    return evaluations


def evaluate_cross_document_rules(po_claims: List[Claim], invoice_claims: List[Claim]) -> List[RuleEvaluationResult]:
    """
    Executes cross-document reconciliation rules between an authorized Purchase Order (PO)
    and a billing Invoice.
    Checks:
    1. Vendor Identity consistency.
    2. Billed Quantity <= Approved PO Quantity.
    3. Invoiced Total <= Approved PO Total (within rounding).
    """
    po_dict = {c.field: c for c in po_claims}
    inv_dict = {c.field: c for c in invoice_claims}
    evaluations: List[RuleEvaluationResult] = []

    # 1. Vendor consistency
    po_vendor = po_dict.get("vendor_name")
    inv_vendor = inv_dict.get("vendor_name")
    if po_vendor and inv_vendor:
        po_v = po_vendor.value.strip().lower()
        inv_v = inv_vendor.value.strip().lower()
        if po_v in inv_v or inv_v in po_v:
            evaluations.append(RuleEvaluationResult(
                rule_name="CROSS_DOCUMENT_VENDOR_MATCH",
                result="PASS",
                description=f"Cross-document vendor matched: PO vendor '{po_vendor.value}' matches Invoice vendor '{inv_vendor.value}'.",
                claim_id=inv_vendor.id,
                authority_level="authoritative"
            ))
        else:
            evaluations.append(RuleEvaluationResult(
                rule_name="CROSS_DOCUMENT_VENDOR_MATCH",
                result="FAIL",
                description=f"Cross-document vendor mismatch: PO vendor is '{po_vendor.value}', but Invoice claims '{inv_vendor.value}'.",
                claim_id=inv_vendor.id,
                authority_level="authoritative"
            ))

    # 2. Total matching
    po_total_claim = po_dict.get("invoice_total") or po_dict.get("po_total")
    inv_total_claim = inv_dict.get("invoice_total")
    if po_total_claim and inv_total_claim:
        po_tot = clean_number(po_total_claim.value)
        inv_tot = clean_number(inv_total_claim.value)
        if po_tot is not None and inv_tot is not None:
            if inv_tot <= po_tot + 0.05:
                evaluations.append(RuleEvaluationResult(
                    rule_name="CROSS_DOCUMENT_PO_TOTAL_MATCH",
                    result="PASS",
                    description=f"Invoiced total (${inv_tot:.2f}) does not exceed authorized PO total (${po_tot:.2f}).",
                    claim_id=inv_total_claim.id,
                    authority_level="authoritative"
                ))
            else:
                evaluations.append(RuleEvaluationResult(
                    rule_name="CROSS_DOCUMENT_PO_TOTAL_MATCH",
                    result="FAIL",
                    description=f"Unauthorized overcharge: Invoiced total (${inv_tot:.2f}) exceeds authorized PO total (${po_tot:.2f}) by ${inv_tot - po_tot:.2f}.",
                    claim_id=inv_total_claim.id,
                    authority_level="authoritative"
                ))

    # 3. Quantity matching
    po_qty_claim = po_dict.get("item_1_quantity")
    inv_qty_claim = inv_dict.get("item_1_quantity")
    if po_qty_claim and inv_qty_claim:
        po_q = clean_number(po_qty_claim.value)
        inv_q = clean_number(inv_qty_claim.value)
        if po_q is not None and inv_q is not None:
            if inv_q <= po_q:
                evaluations.append(RuleEvaluationResult(
                    rule_name="CROSS_DOCUMENT_PO_QUANTITY_MATCH",
                    result="PASS",
                    description=f"Invoiced item quantity ({inv_q}) is within approved PO quantity ({po_q}).",
                    claim_id=inv_qty_claim.id,
                    authority_level="authoritative"
                ))
            else:
                evaluations.append(RuleEvaluationResult(
                    rule_name="CROSS_DOCUMENT_PO_QUANTITY_MATCH",
                    result="FAIL",
                    description=f"Quantity overbill detected: Invoice claims {inv_q} units, but approved PO only authorized {po_q} units.",
                    claim_id=inv_qty_claim.id,
                    authority_level="authoritative"
                ))

    return evaluations
