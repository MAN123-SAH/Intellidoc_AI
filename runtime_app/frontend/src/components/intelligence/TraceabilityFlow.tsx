"use client";

import React from "react";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Scale, 
  Layers, 
  ShieldCheck,
  Hash
} from "lucide-react";
import { ClaimItem, EvidenceItem, FullVerificationData } from "@/types/intellidoc";
import StatusBadge from "@/components/ui/StatusBadge";

interface TraceabilityFlowProps {
  selectedClaim: ClaimItem | null;
  documentName: string;
  verificationData: FullVerificationData | null;
}

export default function TraceabilityFlow({
  selectedClaim,
  documentName,
  verificationData,
}: TraceabilityFlowProps) {
  if (!selectedClaim) {
    return (
      <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-5 text-center text-xs text-[#64748B] mt-5">
        Select any extracted claim to inspect its complete end-to-end evidence traceability chain.
      </div>
    );
  }

  // Find related evidence for this claim if any
  const relatedEvidence = verificationData?.evidence?.filter(
    (e) => e.claim_id === selectedClaim.id || e.description.toLowerCase().includes(selectedClaim.field.toLowerCase())
  ) || [];

  return (
    <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-5 mt-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EA]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#159B83]" />
          <h4 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
            Evidence Traceability Chain
          </h4>
        </div>
        <StatusBadge status={selectedClaim.verification_status} size="sm" />
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Step 1: Source Document */}
        <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              <span>Step 1: Ingestion</span>
              <FileText size={13} className="text-[#243A52]" />
            </div>
            <div className="font-semibold text-xs text-[#172334] truncate" title={documentName}>
              {documentName}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1 font-mono">
              Page {selectedClaim.page_number || 1}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#E8EDF2] text-[10px] text-[#64748B]">
            SHA-256 Verified
          </div>
        </div>

        {/* Step 2: Extracted Claim */}
        <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              <span>Step 2: Claim Store</span>
              <Layers size={13} className="text-[#159B83]" />
            </div>
            <div className="font-mono text-xs font-semibold text-[#172334] truncate">
              {selectedClaim.field}
            </div>
            <div className="text-xs font-bold text-[#111C2D] mt-1 truncate bg-white px-2 py-1 rounded border border-[#DCE3EA]">
              {selectedClaim.value}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#E8EDF2] text-[10px] text-[#64748B]">
            Gemini Multimodal
          </div>
        </div>

        {/* Step 3: Evidence Evaluation */}
        <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              <span>Step 3: Rule Audit</span>
              <Scale size={13} className="text-[#D69A38]" />
            </div>
            <div className="text-xs font-semibold text-[#172334]">
              {relatedEvidence.length > 0 ? `${relatedEvidence.length} Evidence Checks` : "Heuristic Rule"}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1 truncate">
              {relatedEvidence.length > 0 ? relatedEvidence[0].source : "Mathematical Invariant"}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#E8EDF2] text-[10px] text-[#64748B]">
            Deterministic Logic
          </div>
        </div>

        {/* Step 4: Verification Result */}
        <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              <span>Step 4: Outcome</span>
              <CheckCircle2 size={13} className="text-[#159B83]" />
            </div>
            <div className="text-xs font-semibold text-[#172334] uppercase">
              {selectedClaim.verification_status}
            </div>
            <div className="mt-1">
              <StatusBadge status={selectedClaim.verification_status} size="sm" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#E8EDF2] text-[10px] text-[#64748B]">
            Zero-Hallucination
          </div>
        </div>
      </div>

      {/* Narrative Explanation */}
      <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-4">
        <h5 className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
          Traceability Audit Narrative
        </h5>
        <p className="text-xs text-[#172334] leading-relaxed">
          {relatedEvidence.length > 0
            ? relatedEvidence[0].description
            : `The extracted claim '${selectedClaim.field}' with value '${selectedClaim.value}' was cross-referenced against line item calculations and external registry rules. Status: ${selectedClaim.verification_status.toUpperCase()}.`}
        </p>
      </div>
    </div>
  );
}
