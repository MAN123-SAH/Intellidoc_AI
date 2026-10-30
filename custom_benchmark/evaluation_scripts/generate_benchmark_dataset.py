import os
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Set output directories
BASE_DIR = Path(__file__).resolve().parent.parent
INVOICES_DIR = BASE_DIR / "invoices"
GENUINE_INV_DIR = INVOICES_DIR / "genuine"
TAMPERED_INV_DIR = INVOICES_DIR / "tampered"

PO_PAIRS_DIR = BASE_DIR / "po_invoice_pairs"
CONSISTENT_DIR = PO_PAIRS_DIR / "consistent"
INCONSISTENT_DIR = PO_PAIRS_DIR / "inconsistent"

ANNOTATIONS_DIR = BASE_DIR / "annotations"
GROUND_TRUTH_PATH = ANNOTATIONS_DIR / "ground_truth.json"

for d in [GENUINE_INV_DIR, TAMPERED_INV_DIR, CONSISTENT_DIR, INCONSISTENT_DIR, ANNOTATIONS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def get_font(size: int, bold: bool = False):
    """Loads system Arial font or falls back to default."""
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf", size)
        except Exception:
            return ImageFont.load_default()


def render_business_document(
    doc_type: str,  # "INVOICE" or "PURCHASE ORDER"
    doc_number: str,
    vendor_name: str,
    vendor_address: str,
    vendor_tax_id: str,
    client_name: str,
    client_address: str,
    date_label: str,
    date_val: str,
    secondary_date_label: str,
    secondary_date_val: str,
    items: list,  # [{"desc": str, "qty": float, "unit_price": float, "total": float}]
    subtotal: float,
    tax: float,
    shipping: float,
    grand_total: float,
    po_reference: str = None,
    output_path: Path = None,
):
    """Renders a clean, high-resolution business document (850x1100 px)."""
    width, height = 850, 1100
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    title_font = get_font(28, bold=True)
    header_font = get_font(18, bold=True)
    sub_font = get_font(14, bold=True)
    body_font = get_font(13, bold=False)
    bold_body_font = get_font(13, bold=True)
    small_font = get_font(11, bold=False)

    # 1. Header Banner
    banner_color = (24, 30, 48) if doc_type == "INVOICE" else (15, 60, 40)
    draw.rectangle([(0, 0), (width, 8)], fill=banner_color)

    # Title & Doc Number
    draw.text((50, 45), doc_type, fill=banner_color, font=title_font)
    draw.text((50, 85), f"# {doc_number}", fill=(90, 100, 115), font=header_font)

    # Dates (Right aligned)
    draw.text((550, 48), f"{date_label}:", fill=(100, 110, 125), font=bold_body_font)
    draw.text((670, 48), date_val, fill=(30, 35, 45), font=body_font)

    draw.text((550, 72), f"{secondary_date_label}:", fill=(100, 110, 125), font=bold_body_font)
    draw.text((670, 72), secondary_date_val, fill=(30, 35, 45), font=body_font)

    if po_reference:
        draw.text((550, 96), "PO Reference:", fill=(100, 110, 125), font=bold_body_font)
        draw.text((670, 96), po_reference, fill=(30, 35, 45), font=bold_body_font)

    # Divider
    draw.line([(50, 130), (800, 130)], fill=(220, 225, 235), width=2)

    # 2. Vendor & Client Info
    # Vendor (From)
    draw.text((50, 150), "FROM / ISSUER", fill=(130, 140, 155), font=sub_font)
    draw.text((50, 175), vendor_name, fill=(20, 25, 35), font=bold_body_font)
    draw.text((50, 195), vendor_address, fill=(70, 80, 95), font=body_font)
    draw.text((50, 215), f"Tax ID / Reg: {vendor_tax_id}", fill=(70, 80, 95), font=body_font)

    # Client (Bill To)
    draw.text((450, 150), "BILL TO / RECIPIENT", fill=(130, 140, 155), font=sub_font)
    draw.text((450, 175), client_name, fill=(20, 25, 35), font=bold_body_font)
    draw.text((450, 195), client_address, fill=(70, 80, 95), font=body_font)

    # 3. Line Items Table Header
    table_top = 265
    draw.rectangle([(50, table_top), (800, table_top + 32)], fill=(245, 247, 250))
    draw.line([(50, table_top), (800, table_top)], fill=(200, 205, 215), width=1)
    draw.line([(50, table_top + 32), (800, table_top + 32)], fill=(200, 205, 215), width=1)

    draw.text((65, table_top + 8), "ITEM DESCRIPTION", fill=(50, 60, 75), font=bold_body_font)
    draw.text((440, table_top + 8), "QTY", fill=(50, 60, 75), font=bold_body_font)
    draw.text((550, table_top + 8), "UNIT PRICE", fill=(50, 60, 75), font=bold_body_font)
    draw.text((700, table_top + 8), "TOTAL", fill=(50, 60, 75), font=bold_body_font)

    # 4. Table Rows
    curr_y = table_top + 45
    for item in items:
        draw.text((65, curr_y), item["desc"], fill=(30, 35, 45), font=body_font)
        draw.text((445, curr_y), str(item["qty"]), fill=(30, 35, 45), font=body_font)
        draw.text((550, curr_y), f"${item['unit_price']:,.2f}", fill=(30, 35, 45), font=body_font)
        draw.text((700, curr_y), f"${item['total']:,.2f}", fill=(20, 25, 35), font=bold_body_font)
        curr_y += 35
        draw.line([(50, curr_y - 8), (800, curr_y - 8)], fill=(235, 240, 245), width=1)

    # 5. Financial Summary / Totals Block (Right aligned)
    tot_y = max(curr_y + 20, 500)
    draw.line([(500, tot_y), (800, tot_y)], fill=(220, 225, 235), width=1)
    tot_y += 12

    # Subtotal
    draw.text((520, tot_y), "Subtotal:", fill=(80, 90, 105), font=body_font)
    draw.text((700, tot_y), f"${subtotal:,.2f}", fill=(30, 35, 45), font=body_font)
    tot_y += 26

    # Tax
    draw.text((520, tot_y), "Tax:", fill=(80, 90, 105), font=body_font)
    draw.text((700, tot_y), f"${tax:,.2f}", fill=(30, 35, 45), font=body_font)
    tot_y += 26

    # Shipping
    draw.text((520, tot_y), "Shipping:", fill=(80, 90, 105), font=body_font)
    draw.text((700, tot_y), f"${shipping:,.2f}", fill=(30, 35, 45), font=body_font)
    tot_y += 26

    # Grand Total Banner
    draw.rectangle([(500, tot_y), (800, tot_y + 40)], fill=(245, 247, 252))
    draw.rectangle([(500, tot_y), (800, tot_y + 40)], outline=banner_color, width=1)
    draw.text((520, tot_y + 10), "Grand Total:", fill=banner_color, font=bold_body_font)
    draw.text((680, tot_y + 8), f"${grand_total:,.2f}", fill=banner_color, font=header_font)

    # 6. Payment & Notes Footer
    footer_y = 880
    draw.line([(50, footer_y), (800, footer_y)], fill=(225, 230, 240), width=1)
    draw.text((50, footer_y + 15), "PAYMENT TERMS & VERIFICATION NOTICE", fill=(100, 110, 125), font=sub_font)
    draw.text((50, footer_y + 35), "Payment is due according to the payment schedule outlined above.", fill=(90, 100, 115), font=small_font)
    draw.text((50, footer_y + 52), f"Issuer Registry Entity: {vendor_name} | Document Generated for IntelliDoc Automated Verification.", fill=(110, 120, 135), font=small_font)

    # Save
    if output_path:
        img.save(output_path, "PNG", quality=95)
        print(f"Generated: {output_path.name}")
    return img


def generate_benchmark_suite():
    """Builds the complete Ground Truth Benchmark Dataset."""
    ground_truth = []

    # ─────────────────────────────────────────────────────────────
    # CASE 1: Genuine Invoice 1 (Acme Industrial Supplies - Active)
    # ─────────────────────────────────────────────────────────────
    inv_1_path = GENUINE_INV_DIR / "INV_01_GENUINE.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-101",
        vendor_name="Acme Industrial Supplies",
        vendor_address="100 Industrial Parkway, Detroit, USA",
        vendor_tax_id="US-ACME-9912",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="Invoice Date",
        date_val="2024-05-10",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-06-10",
        items=[
            {"desc": "Heavy Duty Industrial Steel Bearings", "qty": 5, "unit_price": 120.00, "total": 600.00},
            {"desc": "Pneumatic Pressure Regulators", "qty": 2, "unit_price": 200.00, "total": 400.00},
        ],
        subtotal=1000.00,
        tax=80.00,
        shipping=20.00,
        grand_total=1100.00,
        output_path=inv_1_path,
    )
    ground_truth.append({
        "id": "INV_01_GENUINE",
        "file": str(inv_1_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "genuine",
        "expected_decision": "verified",
        "expected_failures": [],
        "metadata": {
            "vendor_name": "Acme Industrial Supplies",
            "invoice_total": 1100.00,
            "invoice_subtotal": 1000.00,
            "invoice_tax": 80.00,
            "invoice_shipping": 20.00,
            "invoice_date": "2024-05-10",
            "due_date": "2024-06-10"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 2: Genuine Invoice 2 (Saldo Apps - Active)
    # ─────────────────────────────────────────────────────────────
    inv_2_path = GENUINE_INV_DIR / "INV_02_GENUINE.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-202",
        vendor_name="Saldo Apps",
        vendor_address="First str., 28-32, Chicago, USA",
        vendor_tax_id="US-SALDO-0206",
        client_name="Horizon Dynamics Inc",
        client_address="500 West Madison St, Chicago, USA",
        date_label="Invoice Date",
        date_val="2024-04-01",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-04-30",
        items=[
            {"desc": "Enterprise Mobile Subscription (10 Seats)", "qty": 10, "unit_price": 50.00, "total": 500.00},
        ],
        subtotal=500.00,
        tax=45.00,
        shipping=0.00,
        grand_total=545.00,
        output_path=inv_2_path,
    )
    ground_truth.append({
        "id": "INV_02_GENUINE",
        "file": str(inv_2_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "genuine",
        "expected_decision": "verified",
        "expected_failures": [],
        "metadata": {
            "vendor_name": "Saldo Apps",
            "invoice_total": 545.00,
            "invoice_subtotal": 500.00,
            "invoice_tax": 45.00,
            "invoice_shipping": 0.00,
            "invoice_date": "2024-04-01",
            "due_date": "2024-04-30"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 3: Tampered Invoice (Arithmetic Grand Total Mismatch)
    # Injected Discrepancy: Subtotal (1000) + Tax (80) + Ship (20) = 1100,
    # but Document Claims 1450.00 ($350 overcharge fraud)
    # ─────────────────────────────────────────────────────────────
    inv_3_path = TAMPERED_INV_DIR / "INV_03_ARITHMETIC_TAMPERED.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-303",
        vendor_name="Acme Industrial Supplies",
        vendor_address="100 Industrial Parkway, Detroit, USA",
        vendor_tax_id="US-ACME-9912",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="Invoice Date",
        date_val="2024-05-15",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-06-15",
        items=[
            {"desc": "Hydraulic Couplings & Valves", "qty": 4, "unit_price": 250.00, "total": 1000.00},
        ],
        subtotal=1000.00,
        tax=80.00,
        shipping=20.00,
        grand_total=1450.00,  # <-- TAMPERED (+ $350 padding)
        output_path=inv_3_path,
    )
    ground_truth.append({
        "id": "INV_03_ARITHMETIC_TAMPERED",
        "file": str(inv_3_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "arithmetic_tampered",
        "expected_decision": "requires_review",
        "expected_failures": ["ARITHMETIC_TOTAL_CONSISTENCY"],
        "metadata": {
            "vendor_name": "Acme Industrial Supplies",
            "invoice_total": 1450.00,
            "invoice_subtotal": 1000.00,
            "invoice_tax": 80.00,
            "invoice_shipping": 20.00,
            "injected_error": "Grand total padded by $350.00 above sum of parts"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 4: Tampered Invoice (Temporal Anomaly)
    # Injected Discrepancy: Due Date precedes Issue Date by 5 months
    # ─────────────────────────────────────────────────────────────
    inv_4_path = TAMPERED_INV_DIR / "INV_04_TEMPORAL_ANOMALY.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-404",
        vendor_name="Saldo Apps",
        vendor_address="First str., 28-32, Chicago, USA",
        vendor_tax_id="US-SALDO-0206",
        client_name="Horizon Dynamics Inc",
        client_address="500 West Madison St, Chicago, USA",
        date_label="Invoice Date",
        date_val="2024-08-20",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-03-20",  # <-- TAMPERED (Due 5 months before issuance!)
        items=[
            {"desc": "Enterprise Mobile Analytics Suite", "qty": 1, "unit_price": 750.00, "total": 750.00},
        ],
        subtotal=750.00,
        tax=60.00,
        shipping=0.00,
        grand_total=810.00,
        output_path=inv_4_path,
    )
    ground_truth.append({
        "id": "INV_04_TEMPORAL_ANOMALY",
        "file": str(inv_4_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "temporal_anomaly",
        "expected_decision": "requires_review",
        "expected_failures": ["TEMPORAL_CHRONOLOGY"],
        "metadata": {
            "vendor_name": "Saldo Apps",
            "invoice_date": "2024-08-20",
            "due_date": "2024-03-20",
            "injected_error": "Due date precedes invoice issue date"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 5: Tampered Invoice (Unregistered / Shell Vendor)
    # Injected Discrepancy: Vendor 'Vanguard Phantom Global' does not exist in registry
    # ─────────────────────────────────────────────────────────────
    inv_5_path = TAMPERED_INV_DIR / "INV_05_UNREGISTERED_VENDOR.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-505",
        vendor_name="Vanguard Phantom Global",  # <-- UNREGISTERED
        vendor_address="99 Offshore Cay, Road Town, BVI",
        vendor_tax_id="XX-FAKE-0000",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="Invoice Date",
        date_val="2024-06-01",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-06-30",
        items=[
            {"desc": "Offshore Strategic Consulting Services", "qty": 1, "unit_price": 2500.00, "total": 2500.00},
        ],
        subtotal=2500.00,
        tax=0.00,
        shipping=0.00,
        grand_total=2500.00,
        output_path=inv_5_path,
    )
    ground_truth.append({
        "id": "INV_05_UNREGISTERED_VENDOR",
        "file": str(inv_5_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "unregistered_vendor",
        "expected_decision": "requires_review",
        "expected_failures": ["EXTERNAL_VENDOR_REGISTRY"],
        "metadata": {
            "vendor_name": "Vanguard Phantom Global",
            "injected_error": "Vendor not found in official authority registry"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 6: Tampered Invoice (Suspended Vendor in Registry)
    # Injected Discrepancy: Vendor 'Global Tech Logistics' is marked SUSPENDED in DB
    # ─────────────────────────────────────────────────────────────
    inv_6_path = TAMPERED_INV_DIR / "INV_06_SUSPENDED_VENDOR.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-606",
        vendor_name="Global Tech Logistics",  # <-- SUSPENDED IN REGISTRY
        vendor_address="Alexanderplatz 4, Berlin, Germany",
        vendor_tax_id="DE-GTL-4411",
        client_name="Horizon Dynamics Inc",
        client_address="500 West Madison St, Chicago, USA",
        date_label="Invoice Date",
        date_val="2024-07-10",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-08-10",
        items=[
            {"desc": "Cross-Border Freight Transport", "qty": 1, "unit_price": 1200.00, "total": 1200.00},
        ],
        subtotal=1200.00,
        tax=100.00,
        shipping=50.00,
        grand_total=1350.00,
        output_path=inv_6_path,
    )
    ground_truth.append({
        "id": "INV_06_SUSPENDED_VENDOR",
        "file": str(inv_6_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "suspended_vendor",
        "expected_decision": "requires_review",
        "expected_failures": ["EXTERNAL_VENDOR_REGISTRY"],
        "metadata": {
            "vendor_name": "Global Tech Logistics",
            "injected_error": "Vendor is certified until 2024-01-01 and flagged SUSPENDED"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 7: Tampered Invoice (Line Item Multiplication Anomaly)
    # Injected Discrepancy: Item 1: Qty 4 x $150 = claims $800 (Math: should be $600)
    # ─────────────────────────────────────────────────────────────
    inv_7_path = TAMPERED_INV_DIR / "INV_07_LINE_ITEM_TAMPERED.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-707",
        vendor_name="Acme Industrial Supplies",
        vendor_address="100 Industrial Parkway, Detroit, USA",
        vendor_tax_id="US-ACME-9912",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="Invoice Date",
        date_val="2024-09-01",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-09-30",
        items=[
            {"desc": "Precision Brass Fittings", "qty": 4, "unit_price": 150.00, "total": 800.00},  # <-- TAMPERED (4*150=600, not 800)
        ],
        subtotal=800.00,
        tax=64.00,
        shipping=0.00,
        grand_total=864.00,
        output_path=inv_7_path,
    )
    ground_truth.append({
        "id": "INV_07_LINE_ITEM_TAMPERED",
        "file": str(inv_7_path.relative_to(BASE_DIR)),
        "type": "invoice",
        "category": "line_item_tampered",
        "expected_decision": "requires_review",
        "expected_failures": ["LINE_ITEM_1_ARITHMETIC"],
        "metadata": {
            "vendor_name": "Acme Industrial Supplies",
            "injected_error": "Line item total is $800.00 instead of 4 * 150 = $600.00"
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 8: Consistent PO-Invoice Pair
    # PO-801 matches Invoice INV-801 perfectly
    # ─────────────────────────────────────────────────────────────
    po_8_path = CONSISTENT_DIR / "PO_08_CONSISTENT.png"
    render_business_document(
        doc_type="PURCHASE ORDER",
        doc_number="PO-2024-801",
        vendor_name="Acme Industrial Supplies",
        vendor_address="100 Industrial Parkway, Detroit, USA",
        vendor_tax_id="US-ACME-9912",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="PO Date",
        date_val="2024-05-01",
        secondary_date_label="Delivery Required",
        secondary_date_val="2024-05-20",
        items=[
            {"desc": "Certified Industrial Safety Helmets", "qty": 10, "unit_price": 25.00, "total": 250.00},
        ],
        subtotal=250.00,
        tax=20.00,
        shipping=15.00,
        grand_total=285.00,
        output_path=po_8_path,
    )

    inv_8_path = CONSISTENT_DIR / "INV_08_CONSISTENT.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-801",
        vendor_name="Acme Industrial Supplies",
        vendor_address="100 Industrial Parkway, Detroit, USA",
        vendor_tax_id="US-ACME-9912",
        client_name="Apex Logistics Corp",
        client_address="742 Evergreen Terrace, Springfield, USA",
        date_label="Invoice Date",
        date_val="2024-05-18",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-06-18",
        po_reference="PO-2024-801",
        items=[
            {"desc": "Certified Industrial Safety Helmets", "qty": 10, "unit_price": 25.00, "total": 250.00},
        ],
        subtotal=250.00,
        tax=20.00,
        shipping=15.00,
        grand_total=285.00,
        output_path=inv_8_path,
    )
    ground_truth.append({
        "id": "PAIR_08_CONSISTENT",
        "type": "po_invoice_pair",
        "category": "cross_document_consistent",
        "po_file": str(po_8_path.relative_to(BASE_DIR)),
        "invoice_file": str(inv_8_path.relative_to(BASE_DIR)),
        "expected_decision": "verified",
        "expected_failures": [],
        "metadata": {
            "po_number": "PO-2024-801",
            "invoice_number": "INV-2024-801",
            "vendor_name": "Acme Industrial Supplies",
            "matched_quantity": 10,
            "matched_total": 285.00
        }
    })

    # ─────────────────────────────────────────────────────────────
    # CASE 9: Inconsistent PO-Invoice Pair (Quantity & Price Overbill)
    # PO was approved for 5 licenses ($500), Invoice bills 8 licenses ($800)
    # ─────────────────────────────────────────────────────────────
    po_9_path = INCONSISTENT_DIR / "PO_09_APPROVED.png"
    render_business_document(
        doc_type="PURCHASE ORDER",
        doc_number="PO-2024-902",
        vendor_name="Saldo Apps",
        vendor_address="First str., 28-32, Chicago, USA",
        vendor_tax_id="US-SALDO-0206",
        client_name="Horizon Dynamics Inc",
        client_address="500 West Madison St, Chicago, USA",
        date_label="PO Date",
        date_val="2024-06-01",
        secondary_date_label="Delivery Required",
        secondary_date_val="2024-06-15",
        items=[
            {"desc": "Enterprise Mobile Team Licenses", "qty": 5, "unit_price": 100.00, "total": 500.00},
        ],
        subtotal=500.00,
        tax=40.00,
        shipping=0.00,
        grand_total=540.00,
        output_path=po_9_path,
    )

    inv_9_path = INCONSISTENT_DIR / "INV_09_OVERBILLED.png"
    render_business_document(
        doc_type="INVOICE",
        doc_number="INV-2024-902",
        vendor_name="Saldo Apps",
        vendor_address="First str., 28-32, Chicago, USA",
        vendor_tax_id="US-SALDO-0206",
        client_name="Horizon Dynamics Inc",
        client_address="500 West Madison St, Chicago, USA",
        date_label="Invoice Date",
        date_val="2024-06-14",
        secondary_date_label="Payment Due Date",
        secondary_date_val="2024-07-14",
        po_reference="PO-2024-902",
        items=[
            {"desc": "Enterprise Mobile Team Licenses", "qty": 8, "unit_price": 100.00, "total": 800.00},  # <-- OVERBILL (8 vs 5)
        ],
        subtotal=800.00,
        tax=64.00,
        shipping=0.00,
        grand_total=864.00,
        output_path=inv_9_path,
    )
    ground_truth.append({
        "id": "PAIR_09_INCONSISTENT_OVERBILL",
        "type": "po_invoice_pair",
        "category": "cross_document_overbill",
        "po_file": str(po_9_path.relative_to(BASE_DIR)),
        "invoice_file": str(inv_9_path.relative_to(BASE_DIR)),
        "expected_decision": "requires_review",
        "expected_failures": ["CROSS_DOCUMENT_PO_QUANTITY_MATCH", "CROSS_DOCUMENT_PO_TOTAL_MATCH"],
        "metadata": {
            "po_number": "PO-2024-902",
            "invoice_number": "INV-2024-902",
            "po_quantity": 5,
            "invoice_quantity": 8,
            "po_total": 540.00,
            "invoice_total": 864.00,
            "injected_error": "Invoice bills 8 units ($864) exceeding approved PO of 5 units ($540)"
        }
    })

    # Save Ground Truth JSON
    with open(GROUND_TRUTH_PATH, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)

    print(f"\nSuccessfully generated {len(ground_truth)} benchmark test cases!")
    print(f"Ground truth saved to: {GROUND_TRUTH_PATH}")


if __name__ == "__main__":
    generate_benchmark_suite()
