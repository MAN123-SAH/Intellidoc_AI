"use client";

import React, { useState } from "react";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldAlert, 
  MessageSquare, 
  Eye, 
  Send,
  Sparkles,
  Info
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { ReviewCaseItem } from "@/types/intellidoc";
import { DEMO_REVIEW_CASES } from "@/lib/mockDemonstrationData";
import { ViewKey } from "@/components/layout/AppSidebar";

interface HumanReviewQueueViewProps {
  onNavigate: (view: ViewKey) => void;
}

export default function HumanReviewQueueView({ onNavigate }: HumanReviewQueueViewProps) {
  const [cases, setCases] = useState<ReviewCaseItem[]>(DEMO_REVIEW_CASES);
  const [selectedCase, setSelectedCase] = useState<ReviewCaseItem | null>(DEMO_REVIEW_CASES[0]);
  const [reviewerNote, setReviewerNote] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleRecordDecision = (decision: "RESOLVED" | "ESCALATED") => {
    if (!selectedCase) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: decision,
              notes: reviewerNote ? `${c.notes} | Auditor Decision: ${reviewerNote}` : c.notes,
            }
          : c
      )
    );

    setSelectedCase((prev) => (prev ? { ...prev, status: decision } : null));
    setActionSuccess(`Decision recorded: Case ${selectedCase.case_number} marked as ${decision}.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Review & Compliance Investigation Queue"
        subtitle="Tier-2 investigation queue for unresolved claims, arithmetic discrepancies, and flagged authority sources requiring human adjudicator sign-off."
      >
        <span className="text-[11px] font-mono font-semibold bg-[#D69A38]/10 text-[#D69A38] border border-[#D69A38]/30 px-2.5 py-1 rounded-md">
          INTERACTIVE AUDITOR PROTOTYPE
        </span>
      </PageHeader>

      {actionSuccess && (
        <div className="p-3 bg-[#159B83]/10 border border-[#159B83]/30 text-[#159B83] text-xs font-medium rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Queue Table (7 Cols) and Case Investigator (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Table */}
        <div className="lg:col-span-7 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
          <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-[#243A52]" />
              <h3 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                Pending Investigation Cases ({cases.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">Sorted by Priority</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#DCE3EA] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {cases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#159B83]/10 font-medium" : "hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#172334]">
                        {c.case_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#172334] truncate max-w-[150px]" title={c.document_name}>
                        {c.document_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                        {c.issue_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                            c.priority === "HIGH"
                              ? "bg-[#C65B5B]/10 text-[#C65B5B]"
                              : "bg-[#D69A38]/10 text-[#D69A38]"
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          c.status === "RESOLVED"
                            ? "bg-[#159B83]/10 text-[#159B83]"
                            : c.status === "UNDER_REVIEW"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-[#D69A38]/10 text-[#D69A38]"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-2 py-1 text-[11px] font-semibold text-[#111C2D] bg-[#E8EDF2] hover:bg-[#DCE3EA] rounded transition-all">
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Case Investigator */}
        <div className="lg:col-span-5 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm flex flex-col">
          {selectedCase ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] block">CASE DETAILS</span>
                  <h4 className="text-sm font-bold text-[#172334]">{selectedCase.case_number}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64748B] font-mono">{selectedCase.date_received}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
                {/* Discrepancy Box */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <AlertTriangle size={15} />
                    <span>Flagged Discrepancy Summary</span>
                  </div>
                  <p className="text-[#172334] text-[11px] leading-relaxed">
                    {selectedCase.discrepancy_summary}
                  </p>
                </div>

                {/* Values Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg">
                    <span className="text-[10px] text-[#64748B] font-semibold uppercase block mb-1">
                      Expected / Contractual
                    </span>
                    <div className="font-mono text-xs font-semibold text-[#159B83]">
                      {selectedCase.expected_value}
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg">
                    <span className="text-[10px] text-[#64748B] font-semibold uppercase block mb-1">
                      Extracted / Stated
                    </span>
                    <div className="font-mono text-xs font-semibold text-[#C65B5B]">
                      {selectedCase.extracted_value}
                    </div>
                  </div>
                </div>

                {/* Assigned Auditor */}
                <div className="p-3 bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg flex items-center justify-between">
                  <span className="text-[#64748B]">Assigned Investigator:</span>
                  <span className="font-medium text-[#172334]">{selectedCase.assigned_reviewer}</span>
                </div>

                {/* Current Auditor Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-[#172334] uppercase tracking-wider block mb-1.5">
                    Auditor Review Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter compliance determination, override authorization, or legal inquiry..."
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg p-2.5 text-xs text-[#172334] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111C2D]"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#F7F8FA] border-t border-[#DCE3EA] flex items-center gap-2">
                <button
                  onClick={() => handleRecordDecision("RESOLVED")}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#159B83] hover:bg-[#12816D] rounded shadow-sm transition-all cursor-pointer"
                >
                  Approve & Resolve Case
                </button>
                <button
                  onClick={() => handleRecordDecision("ESCALATED")}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#C65B5B] hover:bg-[#A84949] rounded shadow-sm transition-all cursor-pointer"
                >
                  Escalate to Risk Lead
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              Select a case from the queue to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
