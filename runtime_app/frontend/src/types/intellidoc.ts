// Core TypeScript types for IntelliDoc AI Enterprise Platform

export type VerificationOutcome = "VERIFIED" | "REQUIRES_REVIEW" | "UNVERIFIABLE" | "PENDING";
export type EvidenceResult = "PASS" | "FAIL" | "CONFLICT" | "INCONCLUSIVE";
export type AuthorityLevel = "AUTHORITATIVE" | "DERIVED" | "HEURISTIC" | "UNSPECIFIED";

export interface OCRRegion {
  id: string;
  page_id: string;
  text: string;
  bbox: number[]; // [x0, y0, x1, y1] in pixel or normalized space
  ocr_confidence: number;
  layout_label?: "header" | "question" | "answer" | "other" | string;
  reading_order?: number;
}

export interface PageItem {
  id: string;
  page_number: number;
  image_path?: string;
  width?: number;
  height?: number;
  ocr_regions?: OCRRegion[];
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_hash: string;
  file_type: string;
  file_size_bytes: number;
  page_count: number;
  document_type: "invoice" | "purchase_order" | "receipt" | "certificate" | "unknown";
  type_confidence: number;
  processing_status: "pending" | "processing" | "completed" | "failed";
  decision_status?: "verified" | "requires_review" | "unverifiable" | null;
  uploaded_at: string;
  processed_at?: string | null;
  error_message?: string | null;
  pages: PageItem[];
}

export interface ClaimItem {
  id: string;
  document_id: string;
  field: string;
  value: string;
  data_type: "string" | "number" | "currency" | "date" | "boolean";
  page_number?: number;
  bbox?: number[]; // [ymin, xmin, ymax, xmax] or [x0, y0, x1, y1]
  extraction_confidence?: number;
  verification_status: "verified" | "requires_review" | "unverified" | "conflict";
  extracted_at?: string;
}

export interface EvidenceItem {
  id: string;
  claim_id?: string;
  evidence_type: "rule" | "cross_document" | "forensic" | "external_source" | "ocr" | "layout";
  source: string;
  result: EvidenceResult;
  description: string;
  authority_level: AuthorityLevel;
  raw_data?: Record<string, any>;
  created_at: string;
}

export interface VerificationReport {
  id: string;
  document_id: string;
  decision: "verified" | "requires_review" | "unverifiable";
  explanation: string;
  summary_data?: Record<string, any>;
  generated_at: string;
}

export interface FullVerificationData {
  document_id: string;
  decision: "verified" | "requires_review" | "unverifiable" | "pending";
  explanation?: string;
  total_checks: number;
  checks_passed: number;
  checks_failed: number;
  evidence: EvidenceItem[];
  report?: VerificationReport;
}

export interface CrossDocumentResult {
  po_document_id: string;
  invoice_document_id: string;
  decision: "verified" | "requires_review" | "unverifiable";
  explanation: string;
  total_checks: number;
  checks_passed: number;
  checks_failed: number;
  evidence: {
    rule_name: string;
    result: string;
    description: string;
    authority_level: string;
  }[];
}

export interface ReviewCaseItem {
  id: string;
  case_number: string;
  document_id: string;
  document_name: string;
  issue_type: "ARITHMETIC_MISMATCH" | "VENDOR_SUSPENDED" | "CHRONOLOGY_INVERSION" | "LINE_TOTAL_DISCREPANCY" | "UNRESOLVED_CLAIM";
  priority: "HIGH" | "MEDIUM" | "LOW";
  date_received: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "ESCALATED";
  assigned_reviewer?: string;
  discrepancy_summary: string;
  expected_value?: string;
  extracted_value?: string;
  notes?: string;
}

export interface ForensicResult {
  document_id: string;
  analysis_status: "COMPLETED" | "PENDING" | "UNAVAILABLE";
  is_prototype: boolean;
  tampering_risk: "LOW" | "ELEVATED" | "SUSPICIOUS";
  exif_metadata: {
    format: string;
    color_profile?: string;
    resolution?: string;
    compression?: string;
    creation_software?: string;
    timestamp_modified?: string;
  };
  detected_anomalies: {
    id: string;
    type: string;
    location: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    description: string;
  }[];
  disclaimer: string;
}

export interface ModelTelemetry {
  id: string;
  name: string;
  version: string;
  role: string;
  category: "OCR" | "DOCUMENT_UNDERSTANDING" | "STRUCTURED_EXTRACTION" | "VERIFICATION_ENGINE";
  status: "CONFIGURED_ACTIVE" | "CONNECTED" | "EVALUATION_AVAILABLE" | "OFFLINE";
  checkpoint?: string;
  latency_avg: string;
  ground_truth_accuracy?: string;
  notes: string;
}
