"use client";

import React, { useState } from "react";
import { 
  GitCompare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  ShieldCheck
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentItem, CrossDocumentResult } from "@/types/intellidoc";
import { runCrossDocumentVerification } from "@/lib/api";

interface VerificationWorkbenchViewProps {
  documents: DocumentItem[];
}

export default function VerificationWorkbenchView({
  documents,
}: VerificationWorkbenchViewProps) {
  // PO and Invoice selection
  const [selectedPOId, setSelectedPOId] = useState<string>("");
  const [selectedInvId, setSelectedInvId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CrossDocumentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const poDocs = documents.filter((d) => d.document_type === "purchase_order" || d.original_filename.toLowerCase().includes("po"));
  const invDocs = documents.filter((d) => d.document_type === "invoice" || d.original_filename.toLowerCase().includes("inv"));

  // Default selection if available
  const poDoc = documents.find((d) => d.id === selectedPOId);
  const invDoc = documents.find((d) => d.id === selectedInvId);

  const handleRunReconciliation = async () => {
    if (!selectedPOId || !selectedInvId) {
      setErrorMessage("Please select both an authorized Purchase Order and a billing Invoice.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await runCrossDocumentVerification(selectedPOId, selectedInvId);
      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute cross-document reconciliation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Workbench — Cross-Document Reconciliation"
        subtitle="Independent cross-audit matching billing Invoices against authorized Purchase Orders with deterministic line-item arithmetic invariants."
      />

      {/* Two-Way Document Pairing Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Purchase Order Panel */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#172334] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={15} className="text-[#159B83]" />
              Authorized Purchase Order (PO)
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">Commitment Source</span>
          </div>

          <select
            value={selectedPOId}
            onChange={(e) => setSelectedPOId(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-2.5 text-xs text-[#172334] font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111C2D]"
          >
            <option value="">-- Select Approved Purchase Order --</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename} ({d.document_type.toUpperCase()})
              </option>
            ))}
          </select>

          {poDoc && (
            <div className="mt-3 p-3 bg-[#F7F8FA] rounded-lg text-xs space-y-1">
              <div className="text-[#64748B] flex justify-between">
                <span>File:</span>
                <strong className="text-[#172334] truncate max-w-[200px]">{poDoc.original_filename}</strong>
              </div>
              <div className="text-[#64748B] flex justify-between font-mono text-[11px]">
                <span>SHA-256:</span>
                <span>{poDoc.file_hash.substring(0, 16)}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Panel */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#172334] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={15} className="text-[#D69A38]" />
              Billing Commercial Invoice
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">Claim Source</span>
          </div>

          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-2.5 text-xs text-[#172334] font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111C2D]"
          >
            <option value="">-- Select Billing Invoice --</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename} ({d.document_type.toUpperCase()})
              </option>
            ))}
          </select>

          {invDoc && (
            <div className="mt-3 p-3 bg-[#F7F8FA] rounded-lg text-xs space-y-1">
              <div className="text-[#64748B] flex justify-between">
                <span>File:</span>
                <strong className="text-[#172334] truncate max-w-[200px]">{invDoc.original_filename}</strong>
              </div>
              <div className="text-[#64748B] flex justify-between font-mono text-[11px]">
                <span>SHA-256:</span>
                <span>{invDoc.file_hash.substring(0, 16)}...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button & Errors */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <button
          onClick={handleRunReconciliation}
          disabled={loading || !selectedPOId || !selectedInvId}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-lg shadow-enterprise-md disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
        >
          <GitCompare size={16} className={loading ? "animate-spin" : "text-[#25B499]"} />
          <span>{loading ? "Reconciling Line Items & Math..." : "Execute Cross-Document Reconciliation Audit"}</span>
        </button>

        {errorMessage && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Reconciliation Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Decision Card */}
          <div
            className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              result.decision === "verified"
                ? "bg-[#159B83]/10 border-[#159B83]/30"
                : "bg-[#D69A38]/10 border-[#D69A38]/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <StatusBadge status={result.decision} size="lg" />
              <div>
                <h3 className="text-sm font-bold text-[#172334] tracking-tight">
                  Reconciliation Outcome: {result.decision.toUpperCase().replace("_", " ")}
                </h3>
                <p className="text-xs text-[#172334] mt-1 max-w-2xl leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono shrink-0">
              <div>
                <span className="text-[#64748B] block text-[10px]">Passed Checks</span>
                <strong className="text-[#159B83] text-sm">{result.checks_passed}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">Failed Checks</span>
                <strong className="text-[#C65B5B] text-sm">{result.checks_failed}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">Total Evaluated</span>
                <strong className="text-[#172334] text-sm">{result.total_checks}</strong>
              </div>
            </div>
          </div>

          {/* Detailed Checks Breakdown Table */}
          <div className="bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
            <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[#243A52]" />
                <h4 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                  Reconciliation Checks & Arithmetic Proofs
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#64748B]">Deterministic Python Rule Engine</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FA] border-b border-[#DCE3EA] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Verification Rule</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Evidence Description & Evaluation Proof</th>
                    <th className="py-3 px-4">Authority Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF2]">
                  {result.evidence.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F7F8FA]">
                      <td className="py-3 px-4 font-mono font-semibold text-[#172334]">
                        {item.rule_name}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.result} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-[#172334] leading-relaxed max-w-md">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                        {item.authority_level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal / Compliance Disclaimer */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-xs text-[#64748B] flex items-start gap-3">
            <Info size={18} className="text-[#243A52] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#172334]">Auditor Advisory:</strong> A mismatch outcome indicates a variance between the contractual purchase order authorization and the billing invoice (e.g. quantity variance, price adjustment, or unapproved line-item surcharge). It is not an automated declaration of fraud. Qualified accounts payable personnel should review delivery receipts or tax rate riders before payment release.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
