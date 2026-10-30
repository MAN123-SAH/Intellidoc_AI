"use client";

import React from "react";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/layout/PageHeader";
import { DocumentItem, FullVerificationData } from "@/types/intellidoc";
import { ViewKey } from "@/components/layout/AppSidebar";

interface CommandCenterViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigate: (view: ViewKey) => void;
}

export default function CommandCenterView({
  documents,
  onSelectDocument,
  onNavigate,
}: CommandCenterViewProps) {
  // Aggregate real operational metrics
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.decision_status === "verified").length;
  const reviewDocs = documents.filter((d) => d.decision_status === "requires_review").length;
  const unverifiableDocs = documents.filter((d) => d.decision_status === "unverifiable").length;
  const pendingDocs = totalDocs - (verifiedDocs + reviewDocs + unverifiableDocs);

  // Compute percentages
  const verifiedPct = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;
  const reviewPct = totalDocs > 0 ? Math.round((reviewDocs / totalDocs) * 100) : 0;
  const unverifiablePct = totalDocs > 0 ? Math.round((unverifiableDocs / totalDocs) * 100) : 0;
  const pendingPct = totalDocs > 0 ? Math.round((pendingDocs / totalDocs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle="Executive operational overview of multimodal document ingestion, evidence evaluations, and compliance integrity."
      >
        <button
          onClick={() => onNavigate("intake")}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Ingest New Document</span>
          <ChevronRight size={14} />
        </button>
      </PageHeader>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Documents"
          value={totalDocs}
          description="Ingested across repository"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          label="Verified"
          value={verifiedDocs}
          description="100% evidence-supported"
          icon={CheckCircle2}
          variant="verified"
        />
        <MetricCard
          label="Requires Review"
          value={reviewDocs}
          description="Discrepancies flagged"
          icon={AlertTriangle}
          variant="review"
        />
        <MetricCard
          label="Unverifiable"
          value={unverifiableDocs}
          description="Insufficient evidence"
          icon={HelpCircle}
          variant="unverifiable"
        />
        <MetricCard
          label="Pending Audit"
          value={pendingDocs}
          description="Awaiting rule engine"
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Verification Distribution Bar */}
      <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#172334]">
              Verification Outcome Distribution
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Live breakdown of the three primary verification outcomes across the active repository.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#159B83]" />
              <strong className="text-[#172334]">{verifiedPct}%</strong> Verified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D69A38]" />
              <strong className="text-[#172334]">{reviewPct}%</strong> Review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
              <strong className="text-[#172334]">{unverifiablePct}%</strong> Unverifiable
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3.5 w-full bg-[#E8EDF2] rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${verifiedPct}%` }}
            className="bg-[#159B83] transition-all duration-500"
            title={`Verified: ${verifiedDocs} (${verifiedPct}%)`}
          />
          <div
            style={{ width: `${reviewPct}%` }}
            className="bg-[#D69A38] transition-all duration-500"
            title={`Requires Review: ${reviewDocs} (${reviewPct}%)`}
          />
          <div
            style={{ width: `${unverifiablePct}%` }}
            className="bg-[#64748B] transition-all duration-500"
            title={`Unverifiable: ${unverifiableDocs} (${unverifiablePct}%)`}
          />
          <div
            style={{ width: `${pendingPct}%` }}
            className="bg-blue-300 transition-all duration-500"
            title={`Pending: ${pendingDocs} (${pendingPct}%)`}
          />
        </div>
      </div>

      {/* Two Column Layout: Recent Intake & Quick Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents Table */}
        <div className="lg:col-span-2 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
          <div className="p-4 border-b border-[#DCE3EA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#243A52]" />
              <h3 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                Recent Ingestion Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-semibold text-[#159B83] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Documents</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#DCE3EA] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Document</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Uploaded</th>
                  <th className="py-2.5 px-4">Perception</th>
                  <th className="py-2.5 px-4">Verification</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {documents.slice(0, 6).map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172334] truncate max-w-[200px]" title={doc.original_filename}>
                        {doc.original_filename}
                      </div>
                      <div className="font-mono text-[10px] text-[#94A3B8]">
                        SHA: {doc.file_hash?.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-[#64748B]">
                      {doc.document_type || "Invoice"}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                        doc.processing_status === "completed" 
                          ? "bg-slate-100 text-slate-700" 
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {doc.processing_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.decision_status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          onNavigate("studio");
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#111C2D] bg-[#E8EDF2] hover:bg-[#DCE3EA] rounded transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Key Capabilities & Architecture Pillars */}
        <div className="space-y-4">
          <div className="bg-[#111C2D] text-white rounded-xl p-5 shadow-enterprise-md">
            <div className="flex items-center gap-2 mb-2 text-[#25B499] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>Core System Axiom</span>
            </div>
            <h4 className="text-base font-bold tracking-tight">
              Extraction is NOT Verification
            </h4>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              LLMs read and structure text. IntelliDoc AI independently verifies claims against line item math, temporal order, external registries, and cross-document Purchase Orders.
            </p>
            <div className="mt-4 pt-4 border-t border-[#1E2E44] flex items-center justify-between text-xs">
              <span className="text-slate-400">Deterministic Engine</span>
              <span className="font-mono text-[#25B499]">0.0% Hallucination</span>
            </div>
          </div>

          <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-3">
            <h4 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
              Verification Outcomes Guide
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#159B83]/10 border border-[#159B83]/20">
                <CheckCircle2 size={16} className="text-[#159B83] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#159B83]">VERIFIED</div>
                  <div className="text-[11px] text-[#64748B]">All mathematical invariants, dates, and authority sources confirm the claims.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#D69A38]/10 border border-[#D69A38]/20">
                <AlertTriangle size={16} className="text-[#D69A38] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#D69A38]">REQUIRES REVIEW</div>
                  <div className="text-[11px] text-[#64748B]">A discrepancy or mismatch was found. Requires human auditor attention.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-slate-100 border border-slate-200">
                <HelpCircle size={16} className="text-[#64748B] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#64748B]">UNVERIFIABLE</div>
                  <div className="text-[11px] text-[#64748B]">Insufficient reliable evidence or missing fields prevent proof.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
