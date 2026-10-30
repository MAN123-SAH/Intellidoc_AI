"use client";

import React from "react";
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  Hash, 
  MapPin, 
  Cpu, 
  Scale, 
  Info,
  Clock
} from "lucide-react";
import { ClaimItem, EvidenceItem, FullVerificationData, DocumentItem } from "@/types/intellidoc";
import StatusBadge from "@/components/ui/StatusBadge";

interface ClaimInspectorProps {
  claim: ClaimItem | null;
  document: DocumentItem | null;
  verificationData: FullVerificationData | null;
  onVerifyDocument: () => void;
  verifying: boolean;
}

export default function ClaimInspector({
  claim,
  document,
  verificationData,
  onVerifyDocument,
  verifying,
}: ClaimInspectorProps) {
  if (!claim) {
    return (
      <div className="flex flex-col h-full bg-white border border-[#DCE3EA] rounded-xl p-8 items-center justify-center text-center shadow-enterprise-sm">
        <div className="w-12 h-12 rounded-full bg-[#E8EDF2] flex items-center justify-center text-[#243A52] mb-3">
          <Layers size={22} />
        </div>
        <h4 className="text-sm font-semibold text-[#172334]">No Claim Selected</h4>
        <p className="text-xs text-[#64748B] mt-1 max-w-xs leading-relaxed">
          Select any claim from the center claims store to inspect its source coordinates, evidence chain, and verification proof.
        </p>
      </div>
    );
  }

  // Filter evidence matching this claim
  const claimEvidence = verificationData?.evidence?.filter(
    (e) => e.claim_id === claim.id || e.description.toLowerCase().includes(claim.field.toLowerCase())
  ) || [];

  const passedEvidence = claimEvidence.filter((e) => e.result === "PASS");
  const failedEvidence = claimEvidence.filter((e) => e.result === "FAIL" || e.result === "CONFLICT");

  return (
    <div className="flex flex-col h-full bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
            Claim Inspector
          </span>
          <h3 className="font-mono text-sm font-bold text-[#172334] truncate" title={claim.field}>
            {claim.field}
          </h3>
        </div>
        <StatusBadge status={claim.verification_status} size="sm" />
      </div>

      {/* Inspector Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Value Box */}
        <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Extracted Business Value
          </span>
          <div className="text-sm font-bold text-[#111C2D] font-mono break-all bg-white p-2 rounded border border-[#DCE3EA]">
            {claim.value}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#64748B]">
            <span>Data Type: <strong className="text-[#172334]">{claim.data_type}</strong></span>
            <span>Page: <strong className="text-[#172334]">{claim.page_number || 1}</strong></span>
          </div>
        </div>

        {/* Source Coordinates */}
        <div className="bg-white border border-[#DCE3EA] rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#172334]">
            <MapPin size={13} className="text-[#159B83]" />
            <span>Source Grounding & Provenance</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
            <div>
              <span className="block text-[10px] text-[#94A3B8]">Document</span>
              <span className="font-medium text-[#172334] truncate block" title={document?.original_filename}>
                {document?.original_filename || "N/A"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[#94A3B8]">Extractor</span>
              <span className="font-medium text-[#172334] block">Gemini 2.5 Multimodal</span>
            </div>
          </div>
          {claim.bbox && (
            <div className="mt-1 pt-2 border-t border-[#E8EDF2] text-[10px] font-mono text-[#64748B]">
              Bounding Box: [{claim.bbox.join(", ")}]
            </div>
          )}
        </div>

        {/* Evidence Verification Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#172334] uppercase tracking-wider flex items-center gap-1">
              <Scale size={13} className="text-[#243A52]" />
              Independent Verification Proofs
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              {claimEvidence.length} Checks
            </span>
          </div>

          {claimEvidence.length === 0 ? (
            <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center text-[11px] text-[#64748B]">
              No evidence evaluated for this claim yet.
              <button
                onClick={onVerifyDocument}
                disabled={verifying}
                className="mt-2 block w-full py-1.5 text-xs font-semibold text-white bg-[#159B83] hover:bg-[#12816D] rounded transition-all cursor-pointer"
              >
                {verifying ? "Executing Rules..." : "Run Deterministic Verification"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {claimEvidence.map((ev) => {
                const isPass = ev.result === "PASS";
                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-lg border text-[11px] ${
                      isPass
                        ? "bg-[#159B83]/5 border-[#159B83]/30"
                        : "bg-[#D69A38]/5 border-[#D69A38]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#172334]">{ev.source}</span>
                      <StatusBadge status={ev.result} size="sm" />
                    </div>
                    <p className="text-[#172334] leading-relaxed">
                      {ev.description}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#64748B]">
                      <span>Authority: <strong className="text-[#172334]">{ev.authority_level}</strong></span>
                      <span className="font-mono">{new Date(ev.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Explainability Note */}
        <div className="bg-[#111C2D] text-slate-300 rounded-lg p-3 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Info size={13} className="text-[#25B499]" />
            <span>Verification Principle</span>
          </div>
          <p className="text-slate-300 text-[10px] leading-relaxed">
            Extraction outputs what the document states. Verification checks if that statement satisfies mathematical invariants, vendor registries, and cross-document agreement.
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-3 bg-[#F7F8FA] border-t border-[#DCE3EA]">
        <button
          onClick={onVerifyDocument}
          disabled={verifying}
          className="w-full py-2 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded shadow-enterprise-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck size={14} className="text-[#25B499]" />
          <span>{verifying ? "Executing Verification Engine..." : "Run Full Document Verification"}</span>
        </button>
      </div>
    </div>
  );
}
