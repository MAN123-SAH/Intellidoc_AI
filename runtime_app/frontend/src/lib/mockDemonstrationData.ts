// Realistic Demonstration Data for Specialized Views (Forensics, Review Queue, Model Telemetry)
// All data points are clearly labeled as DEMONSTRATION / BENCHMARK per the project instructions.

import { ReviewCaseItem, ForensicResult, ModelTelemetry } from "@/types/intellidoc";

export const DEMO_REVIEW_CASES: ReviewCaseItem[] = [
  {
    id: "case-rev-0902",
    case_number: "REV-2024-001",
    document_id: "demo-inv-902",
    document_name: "INV_09_OVERBILLED.png",
    issue_type: "LINE_TOTAL_DISCREPANCY",
    priority: "HIGH",
    date_received: "2024-06-14 11:20:45",
    status: "OPEN",
    assigned_reviewer: "Compliance Lead (Senior Auditor)",
    discrepancy_summary: "Calculated arithmetic total ($800.00) differs from extracted line item total or tax rate calculation ($864.00 total stated vs subtotal + tax breakdown).",
    expected_value: "800.00 Subtotal + 64.00 Tax = 864.00",
    extracted_value: "Stated Total: 864.00 with arithmetic flag",
    notes: "Requires manual check on shipping fee waiver and corporate tax rate agreement."
  },
  {
    id: "case-rev-0903",
    case_number: "REV-2024-002",
    document_id: "demo-inv-903",
    document_name: "INV_05_VENDOR_SUSPENDED.png",
    issue_type: "VENDOR_SUSPENDED",
    priority: "HIGH",
    date_received: "2024-06-15 09:14:10",
    status: "UNDER_REVIEW",
    assigned_reviewer: "Procurement Fraud Unit",
    discrepancy_summary: "Vendor 'Global Tech Logistics' (VEND-003) is flagged as SUSPENDED in PostgreSQL external authority registry due to regulatory non-compliance.",
    expected_value: "ACTIVE Vendor in Authority Registry",
    extracted_value: "SUSPENDED (Flagged in External Source DB)",
    notes: "Payment processing blocked until legal counsel reviews certificate of reinstatement."
  },
  {
    id: "case-rev-0904",
    case_number: "REV-2024-003",
    document_id: "demo-inv-904",
    document_name: "INV_06_CHRONOLOGY_FAIL.png",
    issue_type: "CHRONOLOGY_INVERSION",
    priority: "MEDIUM",
    date_received: "2024-06-15 14:32:00",
    status: "OPEN",
    assigned_reviewer: "Accounts Payable Specialist",
    discrepancy_summary: "Temporal chronology inversion detected: Invoice Issue Date (2024-06-20) precedes Purchase Order Creation Date (2024-07-01).",
    expected_value: "Invoice Date >= PO Date",
    extracted_value: "Invoice: 2024-06-20, PO: 2024-07-01",
    notes: "Check if retroactive purchase order was issued post-delivery."
  }
];

export const DEMO_FORENSIC_ANALYSIS: ForensicResult = {
  document_id: "active-doc",
  analysis_status: "COMPLETED",
  is_prototype: true,
  tampering_risk: "LOW",
  exif_metadata: {
    format: "PNG-24 Image with alpha channel",
    color_profile: "sRGB IEC61966-2.1",
    resolution: "300 DPI (Standard Document Scan)",
    compression: "Deflate (Lossless bitstream)",
    creation_software: "IntelliDoc Perception Rasterizer v2.1",
    timestamp_modified: "2024-06-14 10:45:12 UTC"
  },
  detected_anomalies: [
    {
      id: "anom-1",
      type: "Font Glyphs Consistency",
      location: "Header: Invoice Number Region [66, 89, 175, 102]",
      severity: "LOW",
      description: "Consistent font kerning and anti-aliasing profile observed across numerical sequence."
    },
    {
      id: "anom-2",
      type: "Error Level Analysis (ELA)",
      location: "Vendor Tax Identification Block",
      severity: "LOW",
      description: "Compression artifact rate is uniform with neighboring page background pixels."
    }
  ],
  disclaimer: "An anomaly is an indicator requiring investigation, not proof of document manipulation. Digital forensic indicators are supplementary signals designed to assist qualified fraud analysts."
};

export const SYSTEM_MODELS_TELEMETRY: ModelTelemetry[] = [
  {
    id: "mod-tesseract",
    name: "Tesseract OCR Engine",
    version: "v5.5.0",
    role: "Multimodal Word Tokenizer & Pixel Bounding Box Extraction",
    category: "OCR",
    status: "CONFIGURED_ACTIVE",
    latency_avg: "420 ms / page",
    ground_truth_accuracy: "99.4% Character Recall",
    notes: "Native Windows binary engine integrated with PIL preprocessing."
  },
  {
    id: "mod-layoutlmv3",
    name: "Fine-Tuned LayoutLMv3 (FUNSD)",
    version: "PyTorch Spatial Attention",
    role: "Multimodal Form Structure & Token Classification (Header, Question, Answer, Other)",
    category: "DOCUMENT_UNDERSTANDING",
    status: "CONFIGURED_ACTIVE",
    checkpoint: "offline_research/checkpoints/layoutlmv3_funsd/final_model (501 MB)",
    latency_avg: "680 ms / page",
    ground_truth_accuracy: "0.852 F1 / Loss 0.44",
    notes: "Trained on FUNSD scanned business forms."
  },
  {
    id: "mod-layoutlmv3-cord",
    name: "Fine-Tuned LayoutLMv3 (CORD v2)",
    version: "PyTorch Line-Item Specialist",
    role: "Multimodal Line-Item & Receipt Extraction (MENU, SUBTOTAL, TOTAL, VOID)",
    category: "DOCUMENT_UNDERSTANDING",
    status: "CONFIGURED_ACTIVE",
    checkpoint: "MyDrive/intellidoc_checkpoints/layoutlmv3_cord/final_model",
    latency_avg: "520 ms / receipt",
    ground_truth_accuracy: "0.9002 F1 / 91.47% Recall / 88.61% Precision",
    notes: "Jumped from 0.0104 baseline to 0.9002 F1 after 8 epochs on CORD receipts."
  },
  {
    id: "mod-gemini",
    name: "Gemini 2.5 Multimodal Flash",
    version: "2026 Structured Reasoning",
    role: "Zero-Shot Business Claim Extraction (Vendor, PO, Subtotal, Tax, Line Items)",
    category: "STRUCTURED_EXTRACTION",
    status: "CONNECTED",
    latency_avg: "2.4 s / invoice",
    notes: "Outputs strict JSON schema enforced by Pydantic models directly to PostgreSQL."
  },
  {
    id: "mod-rule-engine",
    name: "Deterministic Verification Engine",
    version: "Python 3.12 / SymPy Zero-Hallucination",
    role: "Mathematical Invariant Audits, Date Ordering, Line-Item Cross-Sum, Authority DB Verification",
    category: "VERIFICATION_ENGINE",
    status: "CONFIGURED_ACTIVE",
    latency_avg: "12 ms / document",
    ground_truth_accuracy: "100.0% Precision & 0.0% Hallucination on Custom Benchmark",
    notes: "Never hallucinates mathematical proofs or false positive authority statuses."
  }
];

export const BENCHMARK_9_CASES = [
  {
    id: "TC-01",
    file: "INV_01_CLEAN_VALID.png",
    type: "Clean Invoice",
    ground_truth: "VERIFIED",
    system_decision: "VERIFIED",
    checks_passed: 5,
    checks_failed: 0,
    mismatch_detected: "None (Fully Consistent)",
    status: "PASS"
  },
  {
    id: "TC-02",
    file: "INV_02_ARITHMETIC_ERROR.png",
    type: "Math Tampering",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 4,
    checks_failed: 1,
    mismatch_detected: "Subtotal $800 + Tax $80 ≠ Stated Total $950",
    status: "PASS"
  },
  {
    id: "TC-03",
    file: "INV_03_TAX_INCORRECT.png",
    type: "Tax Mismatch",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 4,
    checks_failed: 1,
    mismatch_detected: "Tax Calculation Error (8% of $800 = $64, stated $120)",
    status: "PASS"
  },
  {
    id: "TC-04",
    file: "INV_04_LINE_ITEMS_SUM_FAIL.png",
    type: "Line Sum Mismatch",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 4,
    checks_failed: 1,
    mismatch_detected: "Sum of Line Items ($750) ≠ Invoice Subtotal ($800)",
    status: "PASS"
  },
  {
    id: "TC-05",
    file: "INV_05_VENDOR_SUSPENDED.png",
    type: "Authority Fraud",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 4,
    checks_failed: 1,
    mismatch_detected: "Vendor VEND-003 status is SUSPENDED in PostgreSQL DB",
    status: "PASS"
  },
  {
    id: "TC-06",
    file: "INV_06_CHRONOLOGY_FAIL.png",
    type: "Date Inversion",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 4,
    checks_failed: 1,
    mismatch_detected: "Invoice Date (2024-06-14) is after Due Date (2024-05-14)",
    status: "PASS"
  },
  {
    id: "TC-07",
    file: "INV_07_MISSING_TOTAL.png",
    type: "Missing Field",
    ground_truth: "UNVERIFIABLE",
    system_decision: "UNVERIFIABLE",
    checks_passed: 1,
    checks_failed: 0,
    mismatch_detected: "Total claim missing; cannot compute arithmetic invariant",
    status: "PASS"
  },
  {
    id: "TC-08",
    file: "PO_01 + INV_08_MATCH.png",
    type: "Cross-Doc Match",
    ground_truth: "VERIFIED",
    system_decision: "VERIFIED",
    checks_passed: 3,
    checks_failed: 0,
    mismatch_detected: "PO line items, quantity, and total exactly reconcile",
    status: "PASS"
  },
  {
    id: "TC-09",
    file: "PO_01 + INV_09_OVERBILLED.png",
    type: "Cross-Doc Overbill",
    ground_truth: "REQUIRES_REVIEW",
    system_decision: "REQUIRES_REVIEW",
    checks_passed: 2,
    checks_failed: 1,
    mismatch_detected: "Invoice Total ($864.00) exceeds PO Authorized ($540.00)",
    status: "PASS"
  }
];
