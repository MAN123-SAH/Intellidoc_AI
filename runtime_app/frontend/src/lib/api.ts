// Centralized Typed API Client for IntelliDoc AI FastAPI Backend

import { 
  DocumentItem, 
  ClaimItem, 
  FullVerificationData, 
  CrossDocumentResult 
} from "@/types/intellidoc";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<{ status: string; message: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Backend server unreachable");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/api/documents?limit=100`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load documents");
  const data = await res.json();
  return data.documents || [];
}

export async function fetchDocumentById(id: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/api/documents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load document details");
  return res.json();
}

export async function uploadDocumentFile(file: File): Promise<{ message: string; document: DocumentItem }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function triggerPerceptionPipeline(documentId: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/process`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Perception failed" }));
    throw new Error(err.detail || "Perception failed");
  }
  return res.json();
}

export async function extractClaimsWithGemini(documentId: string): Promise<{ claims_count: number; claims: ClaimItem[] }> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/extract-claims`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(err.detail || "Extraction failed");
  }
  return res.json();
}

export async function fetchClaims(documentId: string): Promise<ClaimItem[]> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/claims`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.claims || [];
}

export async function triggerVerification(documentId: string): Promise<FullVerificationData> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/verify`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Verification failed" }));
    throw new Error(err.detail || "Verification failed");
  }
  return res.json();
}

export async function fetchVerification(documentId: string): Promise<FullVerificationData | null> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}/verification`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function runCrossDocumentVerification(poDocId: string, invDocId: string): Promise<CrossDocumentResult> {
  const res = await fetch(`${API_BASE}/api/documents/cross-document-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      po_document_id: poDocId,
      invoice_document_id: invDocId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Cross-document reconciliation failed" }));
    throw new Error(err.detail || "Reconciliation failed");
  }
  return res.json();
}

export async function deleteDocumentById(documentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete document");
  }
}

export function getPageImageUrl(documentId: string, pageNumber: number): string {
  return `${API_BASE}/api/documents/${documentId}/pages/${pageNumber}/image`;
}
