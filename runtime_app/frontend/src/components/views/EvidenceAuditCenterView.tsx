"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  Layers, 
  Clock, 
  Database, 
  Search, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Hash
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentItem, FullVerificationData, EvidenceItem } from "@/types/intellidoc";

interface EvidenceAuditCenterViewProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  verificationData: FullVerificationData | null;
  onSelectDocument: (doc: DocumentItem) => void;
}

export default function EvidenceAuditCenterView({
  documents,
  selectedDoc,
  verificationData,
  onSelectDocument,
}: EvidenceAuditCenterViewProps) {
  const [evidenceFilter, setEvidenceFilter] = useState<"ALL" | "PASS" | "FAIL">("ALL");

  const currentDoc = selectedDoc || documents[0];
  const evidenceList = verificationData?.evidence || [];

  const filteredEvidence = evidenceList.filter((e) => {
    if (evidenceFilter === "PASS") return e.result === "PASS";
    if (evidenceFilter === "FAIL") return e.result === "FAIL" || e.result === "CONFLICT";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence & Audit Traceability Center"
        subtitle="End-to-end evidence relationship graph, authority registry provenance, and immutable verification audit trails in PostgreSQL."
      />

      {/* Document Selector Card */}
      <div className="bg-white border border-[#DCE3EA] rounded-xl p-4 shadow-enterprise-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-[#243A52]" />
          <span className="text-xs font-semibold text-[#172334]">Active Document:</span>
          <select
            value={currentDoc?.id || ""}
            onChange={(e) => {
              const d = documents.find((doc) => doc.id === e.target.value);
              if (d) onSelectDocument(d);
            }}
            className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-md px-3 py-1.5 text-xs text-[#172334] font-medium"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span>Decision: <StatusBadge status={verificationData?.decision} size="sm" /></span>
          <span>Total Checks: <strong className="text-[#172334]">{evidenceList.length}</strong></span>
        </div>
      </div>

      {/* CORE ARCHITECTURAL CHAIN VISUALIZATION */}
      <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#159B83]" />
            <h3 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
              Evidence Fusion & Decision Graph
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">Zero-Hallucination Pipeline</span>
        </div>

        {/* Horizontal Chain */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          {/* Node 1 */}
          <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Source</div>
            <div className="font-semibold text-[#172334] truncate">{currentDoc?.original_filename || "Document"}</div>
            <div className="text-[10px] font-mono text-[#94A3B8] mt-1">SHA-256</div>
          </div>

          {/* Node 2 */}
          <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Perception</div>
            <div className="font-semibold text-[#172334]">LayoutLMv3</div>
            <div className="text-[10px] font-mono text-[#94A3B8] mt-1">Tokens Classified</div>
          </div>

          {/* Node 3 */}
          <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Claims</div>
            <div className="font-semibold text-[#172334]">Gemini 2.5</div>
            <div className="text-[10px] font-mono text-[#94A3B8] mt-1">Structured Fields</div>
          </div>

          {/* Node 4 */}
          <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Rules</div>
            <div className="font-semibold text-[#172334]">SymPy Engine</div>
            <div className="text-[10px] font-mono text-[#94A3B8] mt-1">Math & Registry</div>
          </div>

          {/* Node 5 */}
          <div className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-3 text-center">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Evidence</div>
            <div className="font-semibold text-[#172334]">{evidenceList.length} Checks</div>
            <div className="text-[10px] font-mono text-[#94A3B8] mt-1">Authoritative</div>
          </div>

          {/* Node 6 */}
          <div className="bg-[#111C2D] text-white border border-[#111C2D] rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-300 font-semibold uppercase mb-1">Verdict</div>
            <div className="font-bold text-[#25B499] uppercase truncate">
              {verificationData?.decision || "PENDING"}
            </div>
            <div className="text-[10px] font-mono text-slate-300 mt-1">Audited</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Evidence Table + Immutable Audit Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence Table */}
        <div className="lg:col-span-2 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
          <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-[#243A52]" />
              <h4 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                Audited Evidence Items
              </h4>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setEvidenceFilter("ALL")}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  evidenceFilter === "ALL" ? "bg-[#111C2D] text-white" : "bg-[#E8EDF2] text-[#64748B]"
                }`}
              >
                All ({evidenceList.length})
              </button>
              <button
                onClick={() => setEvidenceFilter("PASS")}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  evidenceFilter === "PASS" ? "bg-[#159B83] text-white" : "bg-[#E8EDF2] text-[#64748B]"
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setEvidenceFilter("FAIL")}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  evidenceFilter === "FAIL" ? "bg-[#C65B5B] text-white" : "bg-[#E8EDF2] text-[#64748B]"
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#DCE3EA] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Source / Rule</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Authority</th>
                  <th className="py-2.5 px-4">Evaluation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {filteredEvidence.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#64748B]">
                      No evidence records available. Run verification in the Intelligence Studio.
                    </td>
                  </tr>
                ) : (
                  filteredEvidence.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#F7F8FA]">
                      <td className="py-3 px-4 font-mono font-semibold text-[#172334]">
                        {ev.source}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ev.result} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                        {ev.authority_level}
                      </td>
                      <td className="py-3 px-4 text-[#172334] leading-relaxed max-w-sm">
                        {ev.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Immutable Audit Timeline */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm flex flex-col">
          <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#243A52]" />
              <h4 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                PostgreSQL Audit Log
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#159B83]">IMMUTABLE</span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
            {/* Event 1 */}
            <div className="relative pl-6 pb-4 border-l-2 border-[#DCE3EA] space-y-1">
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#111C2D]" />
              <div className="font-semibold text-[#172334]">DOCUMENT_INGESTED</div>
              <div className="text-[11px] text-[#64748B]">
                SHA-256 generated: <span className="font-mono">{currentDoc?.file_hash.substring(0, 14)}...</span>
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono">
                {currentDoc?.uploaded_at ? new Date(currentDoc.uploaded_at).toLocaleString() : "Live Event"}
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative pl-6 pb-4 border-l-2 border-[#DCE3EA] space-y-1">
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-blue-500" />
              <div className="font-semibold text-[#172334]">PERCEPTION_COMPLETED</div>
              <div className="text-[11px] text-[#64748B]">
                Tesseract v5.5 + LayoutLMv3 classified word bounding tokens.
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono">Status: COMPLETED</div>
            </div>

            {/* Event 3 */}
            <div className="relative pl-6 pb-4 border-l-2 border-[#DCE3EA] space-y-1">
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#159B83]" />
              <div className="font-semibold text-[#172334]">CLAIMS_EXTRACTED</div>
              <div className="text-[11px] text-[#64748B]">
                Gemini Multimodal structured claims committed to PostgreSQL table.
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono">Factual claim store populated</div>
            </div>

            {/* Event 4 */}
            <div className="relative pl-6 space-y-1">
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#D69A38]" />
              <div className="font-semibold text-[#172334]">VERIFICATION_VERDICT</div>
              <div className="text-[11px] text-[#64748B]">
                Deterministic mathematical proofs and vendor registry authority verified.
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono">Final Decision Recorded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
