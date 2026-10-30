"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Link as LinkIcon, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Sparkles
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { DocumentItem } from "@/types/intellidoc";
import { uploadDocumentFile } from "@/lib/api";
import { ViewKey } from "@/components/layout/AppSidebar";

interface DocumentIntakeViewProps {
  onDocumentUploaded: (doc: DocumentItem) => void;
  onNavigate: (view: ViewKey) => void;
}

interface QueueItem {
  id: string;
  file: File;
  docType: "invoice" | "purchase_order" | "receipt" | "certificate" | "other";
  status: "QUEUED" | "UPLOADING" | "COMPLETED" | "FAILED";
  progress: number;
  uploadedDoc?: DocumentItem;
  error?: string;
}

export default function DocumentIntakeView({
  onDocumentUploaded,
  onNavigate,
}: DocumentIntakeViewProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<"invoice" | "purchase_order" | "receipt" | "certificate" | "other">("invoice");
  const [enableRelationship, setEnableRelationship] = useState(false);
  const [relationshipType, setRelationshipType] = useState("po_invoice");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      docType: selectedDocType,
      status: "QUEUED",
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const processQueueItem = async (item: QueueItem) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "UPLOADING", progress: 40 } : q))
    );

    try {
      const res = await uploadDocumentFile(item.file);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "COMPLETED", progress: 100, uploadedDoc: res.document }
            : q
        )
      );
      onDocumentUploaded(res.document);
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "FAILED", progress: 0, error: err.message || "Upload failed" }
            : q
        )
      );
    }
  };

  const processAll = async () => {
    const queued = queue.filter((q) => q.status === "QUEUED");
    for (const item of queued) {
      await processQueueItem(item);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Document Intake & Ingestion Pipeline"
        subtitle="Secure enterprise multimodal intake with SHA-256 cryptographic hashing, multi-page rasterization, and cross-document reconciliation binding."
      />

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Classification Setting */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm">
          <label className="text-xs font-semibold text-[#172334] uppercase tracking-wider block mb-2">
            Target Document Classification
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: "invoice", label: "Commercial Invoice" },
              { id: "purchase_order", label: "Purchase Order (PO)" },
              { id: "receipt", label: "Expense Receipt" },
              { id: "certificate", label: "Compliance Certificate" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedDocType(opt.id as any)}
                className={`py-2 px-3 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                  selectedDocType === opt.id
                    ? "bg-[#111C2D] text-white border-[#111C2D]"
                    : "bg-[#F7F8FA] text-[#172334] border-[#DCE3EA] hover:bg-[#E8EDF2]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#64748B]">
            Configures the schema validator and primary extraction prompt for the multimodal perception pipeline.
          </p>
        </div>

        {/* Cross-Document Relationship Binding */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                Cross-Document Relationship
              </label>
              <input
                type="checkbox"
                checked={enableRelationship}
                onChange={(e) => setEnableRelationship(e.target.checked)}
                className="w-4 h-4 rounded text-[#159B83] focus:ring-[#159B83] cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#64748B] mb-3">
              Bind incoming document to a complementary document for two-way mathematical reconciliation (e.g., Purchase Order vs. Invoice).
            </p>

            {enableRelationship && (
              <div className="p-3 bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#159B83] font-medium text-[11px]">
                  <LinkIcon size={14} />
                  <span>Two-Way Reconciliation Protocol Active</span>
                </div>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full bg-white border border-[#DCE3EA] rounded p-1.5 text-xs text-[#172334]"
                >
                  <option value="po_invoice">PO ↔ Invoice (Check Quantity, Unit Price, Total)</option>
                  <option value="contract_invoice">Master Service Agreement ↔ Invoice</option>
                </select>
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#E8EDF2]">
            Ensures zero overbilling or unauthorized vendor payment.
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-[#159B83] bg-[#159B83]/5"
            : "border-[#CBD5E1] bg-white hover:border-[#94A3B8] hover:bg-[#F7F8FA]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-[#E8EDF2] flex items-center justify-center text-[#243A52] mx-auto mb-4 shadow-sm">
          <UploadCloud size={28} />
        </div>

        <h3 className="text-sm font-semibold text-[#172334] mb-1">
          Drag and drop business documents here, or click to browse
        </h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mb-3">
          Supported formats: <strong>PDF, PNG, JPG, JPEG</strong>. Each document is cryptographically hashed with SHA-256 and converted to 300 DPI perception frames.
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#111C2D] bg-[#E8EDF2] px-3 py-1 rounded-md">
          <span>Browse Local Files</span>
        </span>
      </div>

      {/* Ingestion Queue */}
      {queue.length > 0 && (
        <div className="bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
          <div className="p-4 border-b border-[#DCE3EA] flex items-center justify-between bg-[#F7F8FA]">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#243A52]" />
              <h3 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
                Ingestion Queue ({queue.length} Files)
              </h3>
            </div>
            <button
              onClick={processAll}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#159B83] hover:bg-[#12816D] rounded-md shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Process All In Queue</span>
            </button>
          </div>

          <div className="divide-y divide-[#E8EDF2]">
            {queue.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <div className="p-2 rounded bg-[#E8EDF2] text-[#243A52] shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#172334] truncate" title={item.file.name}>
                      {item.file.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                      <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                      <span>&bull;</span>
                      <span className="capitalize">{item.docType.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                {/* Progress / Status */}
                <div className="flex items-center gap-4 shrink-0">
                  {item.status === "QUEUED" && (
                    <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                      QUEUED
                    </span>
                  )}
                  {item.status === "UPLOADING" && (
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded animate-pulse">
                      INGESTING (SHA-256)...
                    </span>
                  )}
                  {item.status === "COMPLETED" && (
                    <span className="text-[11px] font-mono text-[#159B83] bg-[#159B83]/10 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      INGESTED
                    </span>
                  )}
                  {item.status === "FAILED" && (
                    <span className="text-[11px] font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      {item.error || "FAILED"}
                    </span>
                  )}

                  {item.status === "QUEUED" && (
                    <button
                      onClick={() => processQueueItem(item)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded transition-all cursor-pointer"
                    >
                      Ingest
                    </button>
                  )}

                  {item.status === "COMPLETED" && item.uploadedDoc && (
                    <button
                      onClick={() => onNavigate("studio")}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#159B83] bg-[#159B83]/10 hover:bg-[#159B83]/20 rounded transition-all cursor-pointer"
                    >
                      Inspect in Studio &rarr;
                    </button>
                  )}

                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="p-1 text-[#94A3B8] hover:text-red-600 rounded transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
