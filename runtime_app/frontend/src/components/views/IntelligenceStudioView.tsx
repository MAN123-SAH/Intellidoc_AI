"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Cpu,
  ChevronDown
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import DocumentViewer from "@/components/document/DocumentViewer";
import ClaimsList from "@/components/intelligence/ClaimCard";
import ClaimInspector from "@/components/intelligence/ClaimInspector";
import TraceabilityFlow from "@/components/intelligence/TraceabilityFlow";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentItem, ClaimItem, FullVerificationData, OCRRegion } from "@/types/intellidoc";

interface IntelligenceStudioViewProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  claims: ClaimItem[];
  selectedClaim: ClaimItem | null;
  onSelectClaim: (claim: ClaimItem) => void;
  verificationData: FullVerificationData | null;
  activePageNum: number;
  onPageChange: (pageNum: number) => void;
  onRunPerception: (docId: string) => void;
  onExtractClaims: (docId: string) => void;
  onVerifyDocument: (docId: string) => void;
  processingPerception: boolean;
  extractingClaims: boolean;
  verifying: boolean;
}

export default function IntelligenceStudioView({
  documents,
  selectedDoc,
  onSelectDocument,
  claims,
  selectedClaim,
  onSelectClaim,
  verificationData,
  activePageNum,
  onPageChange,
  onRunPerception,
  onExtractClaims,
  onVerifyDocument,
  processingPerception,
  extractingClaims,
  verifying,
}: IntelligenceStudioViewProps) {
  const [hoveredRegion, setHoveredRegion] = useState<OCRRegion | null>(null);

  // If region is clicked in document viewer, find matching claim
  const handleRegionClick = (region: OCRRegion) => {
    const matchingClaim = claims.find(
      (c) => c.value && c.value.toLowerCase().includes(region.text.toLowerCase())
    );
    if (matchingClaim) {
      onSelectClaim(matchingClaim);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Document Selector and Actions */}
      <PageHeader
        title="Document Intelligence Studio"
        subtitle="Signature multimodal workspace: High-resolution OCR token perception, structured Gemini claim store, and deterministic verification proof inspector."
      >
        {/* Document Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#64748B]">Active Document:</label>
          <select
            value={selectedDoc?.id || ""}
            onChange={(e) => {
              const doc = documents.find((d) => d.id === e.target.value);
              if (doc) onSelectDocument(doc);
            }}
            className="bg-white border border-[#DCE3EA] rounded-md px-3 py-1.5 text-xs text-[#172334] font-medium shadow-enterprise-sm focus:outline-none max-w-xs truncate"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename} ({d.decision_status?.toUpperCase() || "PENDING"})
              </option>
            ))}
          </select>
        </div>

        {selectedDoc && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunPerception(selectedDoc.id)}
              disabled={processingPerception}
              className="px-3 py-1.5 text-xs font-semibold text-[#172334] bg-white border border-[#DCE3EA] hover:bg-[#F7F8FA] rounded-md shadow-enterprise-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu size={13} className={processingPerception ? "animate-spin" : ""} />
              <span>{processingPerception ? "Perception..." : "Run LayoutLMv3"}</span>
            </button>

            <button
              onClick={() => onExtractClaims(selectedDoc.id)}
              disabled={extractingClaims}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className={extractingClaims ? "animate-spin text-[#25B499]" : ""} />
              <span>{extractingClaims ? "Extracting..." : "Extract Claims"}</span>
            </button>

            <button
              onClick={() => onVerifyDocument(selectedDoc.id)}
              disabled={verifying}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#159B83] hover:bg-[#12816D] rounded-md shadow-enterprise-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} className={verifying ? "animate-spin" : ""} />
              <span>{verifying ? "Verifying..." : "Verify Claims"}</span>
            </button>
          </div>
        )}
      </PageHeader>

      {/* Tri-State Decision Banner (If verified) */}
      {verificationData && verificationData.decision !== "pending" && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            verificationData.decision === "verified"
              ? "bg-[#159B83]/10 border-[#159B83]/30 text-[#159B83]"
              : verificationData.decision === "requires_review"
              ? "bg-[#D69A38]/10 border-[#D69A38]/30 text-[#D69A38]"
              : "bg-slate-100 border-slate-200 text-[#64748B]"
          }`}
        >
          <div className="flex items-center gap-3">
            <StatusBadge status={verificationData.decision} size="lg" />
            <div>
              <div className="text-xs font-bold text-[#172334] tracking-tight">
                Deterministic Engine Verdict: {verificationData.decision.toUpperCase().replace("_", " ")}
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
                {verificationData.explanation ||
                  `${verificationData.checks_passed} checks passed out of ${verificationData.total_checks} deterministic evaluation rules.`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <span>Passed: <strong className="text-[#159B83]">{verificationData.checks_passed}</strong></span>
            <span>Failed: <strong className="text-[#C65B5B]">{verificationData.checks_failed}</strong></span>
            <span>Total: <strong className="text-[#172334]">{verificationData.total_checks}</strong></span>
          </div>
        </div>
      )}

      {/* THE SIGNATURE THREE-PANEL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[750px] min-h-[750px]">
        {/* LEFT PANEL: Document Visual Viewer (5 Cols) */}
        <div className="lg:col-span-5 h-full min-h-0 overflow-hidden">
          <DocumentViewer
            document={selectedDoc}
            activePageNum={activePageNum}
            onPageChange={onPageChange}
            selectedClaim={selectedClaim}
            onRegionClick={handleRegionClick}
            hoveredRegion={hoveredRegion}
            setHoveredRegion={setHoveredRegion}
          />
        </div>

        {/* CENTER PANEL: Extracted Claims (4 Cols) */}
        <div className="lg:col-span-4 h-full min-h-0 overflow-hidden">
          <ClaimsList
            claims={claims}
            selectedClaim={selectedClaim}
            onSelectClaim={onSelectClaim}
            onExtractClaims={() => selectedDoc && onExtractClaims(selectedDoc.id)}
            extracting={extractingClaims}
          />
        </div>

        {/* RIGHT PANEL: Claim Inspector & Proof Engine (3 Cols) */}
        <div className="lg:col-span-3 h-full min-h-0 overflow-hidden">
          <ClaimInspector
            claim={selectedClaim}
            document={selectedDoc}
            verificationData={verificationData}
            onVerifyDocument={() => selectedDoc && onVerifyDocument(selectedDoc.id)}
            verifying={verifying}
          />
        </div>
      </div>

      {/* SIGNATURE CLAIM-TO-EVIDENCE TRACEABILITY CHAIN */}
      <TraceabilityFlow
        selectedClaim={selectedClaim}
        documentName={selectedDoc?.original_filename || "N/A"}
        verificationData={verificationData}
      />
    </div>
  );
}
