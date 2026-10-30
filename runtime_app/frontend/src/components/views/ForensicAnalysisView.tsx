"use client";

import React, { useState } from "react";
import { 
  ScanLine, 
  FileText, 
  ShieldAlert, 
  Eye, 
  Maximize2, 
  ZoomIn, 
  Info, 
  AlertTriangle,
  Sparkles,
  Camera,
  Cpu
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentItem } from "@/types/intellidoc";
import { DEMO_FORENSIC_ANALYSIS } from "@/lib/mockDemonstrationData";
import { getPageImageUrl } from "@/lib/api";

interface ForensicAnalysisViewProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
}

export default function ForensicAnalysisView({
  documents,
  selectedDoc,
  onSelectDocument,
}: ForensicAnalysisViewProps) {
  const [forensicMode, setForensicMode] = useState<"standard" | "ela" | "invert">("standard");
  const [activeTab, setActiveTab] = useState<"anomalies" | "metadata" | "limitations">("anomalies");

  const forensicData = DEMO_FORENSIC_ANALYSIS;
  const currentDoc = selectedDoc || documents[0];
  const imageUrl = currentDoc ? getPageImageUrl(currentDoc.id, 1) : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forensic Document Analysis & Manipulation Detection"
        subtitle="Digital document integrity suite: Error level analysis (ELA), font kerning consistency, bitstream compression profiling, and metadata provenance."
      >
        <span className="text-[11px] font-mono font-semibold bg-[#D69A38]/10 text-[#D69A38] border border-[#D69A38]/30 px-2.5 py-1 rounded-md">
          PROTOTYPE DEMONSTRATION SUITE
        </span>
      </PageHeader>

      {/* Document Selector */}
      <div className="bg-white border border-[#DCE3EA] rounded-xl p-4 shadow-enterprise-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-[#243A52]" />
          <span className="text-xs font-semibold text-[#172334]">Inspect Document:</span>
          <select
            value={currentDoc?.id || ""}
            onChange={(e) => {
              const d = documents.find((doc) => doc.id === e.target.value);
              if (d) onSelectDocument(d);
            }}
            className="bg-[#F7F8FA] border border-[#DCE3EA] rounded-md px-3 py-1 text-xs text-[#172334] font-medium"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748B]">Filter Mode:</span>
          <button
            onClick={() => setForensicMode("standard")}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              forensicMode === "standard" ? "bg-[#111C2D] text-white" : "bg-[#F7F8FA] text-[#64748B]"
            }`}
          >
            Original Spectrum
          </button>
          <button
            onClick={() => setForensicMode("ela")}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              forensicMode === "ela" ? "bg-[#111C2D] text-white" : "bg-[#F7F8FA] text-[#64748B]"
            }`}
          >
            ELA Simulation
          </button>
          <button
            onClick={() => setForensicMode("invert")}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              forensicMode === "invert" ? "bg-[#111C2D] text-white" : "bg-[#F7F8FA] text-[#64748B]"
            }`}
          >
            Inverted Contrast
          </button>
        </div>
      </div>

      {/* Main Two-Panel Forensic Inspection Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left: Forensic Image Inspector (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm flex flex-col">
          <div className="p-3 bg-[#F7F8FA] border-b border-[#DCE3EA] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#172334] flex items-center gap-1.5">
              <ScanLine size={14} className="text-[#159B83]" />
              Raster Canvas & Compression Overlay
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">300 DPI Bitstream</span>
          </div>

          <div className="flex-1 overflow-auto bg-[#111C2D] p-6 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Forensic View"
                className={`max-w-[500px] h-auto rounded shadow-lg transition-all ${
                  forensicMode === "ela"
                    ? "brightness-125 contrast-200 hue-rotate-180"
                    : forensicMode === "invert"
                    ? "invert contrast-150"
                    : ""
                }`}
              />
            ) : (
              <div className="text-slate-400 text-xs">No image loaded.</div>
            )}
          </div>

          <div className="p-3 bg-[#F7F8FA] border-t border-[#DCE3EA] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Filter Active: <strong className="text-[#172334] uppercase font-mono">{forensicMode}</strong></span>
            <span>Tampering Risk Profile: <strong className="text-[#159B83] font-mono">{forensicData.tampering_risk}</strong></span>
          </div>
        </div>

        {/* Right: Forensic Diagnostics, Anomaly Logs & Metadata (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm flex flex-col">
          {/* Tabs */}
          <div className="flex items-center border-b border-[#DCE3EA] bg-[#F7F8FA] text-xs font-medium">
            <button
              onClick={() => setActiveTab("anomalies")}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${
                activeTab === "anomalies" ? "border-[#111C2D] text-[#111C2D] font-bold" : "border-transparent text-[#64748B]"
              }`}
            >
              Anomalies ({forensicData.detected_anomalies.length})
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${
                activeTab === "metadata" ? "border-[#111C2D] text-[#111C2D] font-bold" : "border-transparent text-[#64748B]"
              }`}
            >
              EXIF & Bitstream
            </button>
            <button
              onClick={() => setActiveTab("limitations")}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${
                activeTab === "limitations" ? "border-[#111C2D] text-[#111C2D] font-bold" : "border-transparent text-[#64748B]"
              }`}
            >
              Analysis Policy
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {activeTab === "anomalies" && (
              <div className="space-y-3">
                <div className="text-[11px] text-[#64748B]">
                  Evaluates pixel gradient variances, local compression artifacts, and character baseline alignment.
                </div>
                {forensicData.detected_anomalies.map((anom) => (
                  <div key={anom.id} className="p-3 bg-[#F7F8FA] border border-[#DCE3EA] rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#172334]">{anom.type}</span>
                      <span className="text-[10px] font-mono text-[#159B83] bg-[#159B83]/10 px-1.5 py-0.5 rounded">
                        {anom.severity} RISK
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B]">{anom.location}</div>
                    <p className="text-[11px] text-[#172334] leading-relaxed">{anom.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "metadata" && (
              <div className="space-y-2">
                {Object.entries(forensicData.exif_metadata).map(([key, value]) => (
                  <div key={key} className="p-2.5 bg-[#F7F8FA] rounded-md border border-[#DCE3EA] flex items-center justify-between">
                    <span className="text-[#64748B] capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="font-mono text-[#172334] font-medium truncate max-w-[220px]" title={value}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "limitations" && (
              <div className="space-y-3 text-xs text-[#172334] leading-relaxed">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <AlertTriangle size={14} />
                    <span>Scientific Disclaimer</span>
                  </div>
                  <p className="text-[11px]">
                    {forensicData.disclaimer}
                  </p>
                </div>
                <div className="space-y-2 text-[11px] text-[#64748B]">
                  <p>&bull; Digital scanning, multi-generation photocopying, and PDF re-compression naturally introduce high-frequency pixel variations.</p>
                  <p>&bull; Anomaly indicators must always be corroborated by external bank statements, registered tax filings, or vendor confirmations.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Card */}
          <div className="p-3 bg-[#111C2D] text-slate-300 text-[11px] flex items-center justify-between">
            <span>Model: PyTorch ELA Filter</span>
            <span className="text-[#25B499] font-mono">Prototype V1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
