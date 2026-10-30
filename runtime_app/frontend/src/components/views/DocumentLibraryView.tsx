"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Layers, 
  Trash2, 
  Eye, 
  ChevronRight, 
  RefreshCw,
  Hash,
  Download,
  ShieldCheck
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { DocumentItem } from "@/types/intellidoc";
import { ViewKey } from "@/components/layout/AppSidebar";

interface DocumentLibraryViewProps {
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onNavigate: (view: ViewKey) => void;
}

export default function DocumentLibraryView({
  documents,
  loading,
  onRefresh,
  onSelectDocument,
  onDeleteDocument,
  onNavigate,
}: DocumentLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VERIFIED" | "REVIEW" | "UNVERIFIABLE" | "PENDING">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "VERIFIED") matchesStatus = doc.decision_status === "verified";
    if (statusFilter === "REVIEW") matchesStatus = doc.decision_status === "requires_review";
    if (statusFilter === "UNVERIFIABLE") matchesStatus = doc.decision_status === "unverifiable";
    if (statusFilter === "PENDING") matchesStatus = !doc.decision_status;

    let matchesType = true;
    if (typeFilter !== "ALL") matchesType = doc.document_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Repository & Library"
        subtitle="Auditable repository of business documents with cryptographic SHA-256 signatures, page-level visual perception frames, and verification verdicts."
      >
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-semibold text-[#172334] bg-white border border-[#DCE3EA] hover:bg-[#F7F8FA] rounded-md shadow-enterprise-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Repository</span>
        </button>

        <button
          onClick={() => onNavigate("intake")}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Ingest Document</span>
        </button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DCE3EA] rounded-xl p-4 shadow-enterprise-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search filename, hash, or UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#172334] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111C2D]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center rounded-lg border border-[#DCE3EA] bg-[#F7F8FA] p-0.5 text-[11px]">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-[#111C2D] shadow-sm font-semibold" : "text-[#64748B]"
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setStatusFilter("VERIFIED")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "VERIFIED" ? "bg-white text-[#159B83] shadow-sm font-semibold" : "text-[#64748B]"
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setStatusFilter("REVIEW")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "REVIEW" ? "bg-white text-[#D69A38] shadow-sm font-semibold" : "text-[#64748B]"
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setStatusFilter("UNVERIFIABLE")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "UNVERIFIABLE" ? "bg-white text-[#64748B] shadow-sm font-semibold" : "text-[#64748B]"
              }`}
            >
              Unverifiable
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-md px-2.5 py-1.5 text-xs text-[#172334] focus:outline-none"
          >
            <option value="ALL">All Document Types</option>
            <option value="invoice">Invoice</option>
            <option value="purchase_order">Purchase Order</option>
            <option value="receipt">Receipt</option>
            <option value="certificate">Certificate</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Documents Found"
          description={
            documents.length === 0
              ? "Your document library is empty. Upload your first document to initiate multimodal perception and claim verification."
              : "No documents match your search and filter criteria. Try adjusting your query."
          }
          actionText={documents.length === 0 ? "Ingest First Document" : "Reset Filters"}
          onAction={() => {
            if (documents.length === 0) onNavigate("intake");
            else {
              setSearchQuery("");
              setStatusFilter("ALL");
              setTypeFilter("ALL");
            }
          }}
        />
      ) : (
        <div className="bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#DCE3EA] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-3 px-4">Document Name & Hash</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Ingested At</th>
                  <th className="py-3 px-4">Perception</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#172334] max-w-[280px] truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </div>
                      <div className="font-mono text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Hash size={10} />
                        <span>{doc.file_hash?.substring(0, 16)}...</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-[#172334] font-medium">
                      {doc.document_type || "Invoice"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#64748B]">
                      {doc.page_count}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {(doc.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        doc.processing_status === "completed" 
                          ? "bg-slate-100 text-slate-700 border border-slate-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {doc.processing_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.decision_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectDocument(doc);
                            onNavigate("studio");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#111C2D] bg-[#E8EDF2] hover:bg-[#DCE3EA] rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 text-[#94A3B8] hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
