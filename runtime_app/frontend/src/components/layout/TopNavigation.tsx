"use client";

import React from "react";
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  Database, 
  User, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { ViewKey } from "./AppSidebar";

interface TopNavigationProps {
  currentView: ViewKey;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onUploadClick: () => void;
  documentsCount: number;
}

const VIEW_TITLES: Record<ViewKey, { title: string; category: string; description: string }> = {
  command_center: {
    category: "WORKSPACE",
    title: "Command Center",
    description: "Executive operations dashboard and verification metric distribution."
  },
  intake: {
    category: "WORKSPACE",
    title: "Document Intake",
    description: "Multimodal ingestion pipeline, SHA-256 integrity, and PO-Invoice pairing."
  },
  library: {
    category: "WORKSPACE",
    title: "Document Library",
    description: "Comprehensive repository of ingested documents, claims, and verification states."
  },
  studio: {
    category: "INTELLIGENCE",
    title: "Document Intelligence Studio",
    description: "Interactive three-panel workspace: Visual OCR Viewer, Claim Extractor & Evidence Inspector."
  },
  workbench: {
    category: "WORKSPACE",
    title: "Verification Workbench",
    description: "Cross-document reconciliation: Purchase Order vs. Invoice with deterministic arithmetic checks."
  },
  forensics: {
    category: "INTELLIGENCE",
    title: "Forensic Analysis",
    description: "Digital image manipulation inspection, metadata integrity, and anomaly detection."
  },
  audit_center: {
    category: "INTELLIGENCE",
    title: "Evidence & Audit Center",
    description: "Full claim-to-evidence traceability chain and immutable PostgreSQL audit trails."
  },
  review_queue: {
    category: "WORKSPACE",
    title: "Human Review Queue",
    description: "Authorized reviewer workbench for flagged discrepancies and unresolved claims."
  },
  observatory: {
    category: "INTELLIGENCE",
    title: "Model Observatory",
    description: "Telemetry, configuration, and evaluation benchmarks for multimodal perception engines."
  },
  settings: {
    category: "SYSTEM",
    title: "System Settings",
    description: "Workspace configuration, verification rule thresholds, and access control."
  },
  docs: {
    category: "SYSTEM",
    title: "System Architecture & Specs",
    description: "Complete technical architecture, FUNSD LayoutLMv3 weights, and benchmark proofs."
  }
};

export default function TopNavigation({
  currentView,
  searchQuery,
  onSearchChange,
  onUploadClick,
  documentsCount,
}: TopNavigationProps) {
  const currentMeta = VIEW_TITLES[currentView] || {
    category: "WORKSPACE",
    title: "IntelliDoc AI",
    description: "Document Verification Platform"
  };

  return (
    <header className="h-16 bg-white border-b border-[#DCE3EA] px-8 flex items-center justify-between sticky top-0 z-20 shadow-enterprise-sm">
      {/* Left: Breadcrumbs & Current Page Info */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
          {currentMeta.category}
        </span>
        <ChevronRight size={14} className="text-[#94A3B8]" />
        <h1 className="text-sm font-semibold text-[#172334] tracking-tight">
          {currentMeta.title}
        </h1>
      </div>

      {/* Middle: Universal Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search documents, invoice #, vendor, or hash..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md pl-9 pr-4 py-1.5 text-xs text-[#172334] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111C2D] focus:border-[#111C2D] transition-all"
          />
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={onUploadClick}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Ingest Document</span>
        </button>

        <div className="h-5 w-px bg-[#DCE3EA]" />

        {/* Workspace Indicator */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Database size={15} className="text-[#243A52]" />
          <span className="font-medium text-[#172334]">Production Workspace</span>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-7 h-7 rounded-full bg-[#E8EDF2] border border-[#DCE3EA] flex items-center justify-center text-[#172334] font-medium text-xs">
            AU
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-medium text-[#172334] leading-none">Auditor Lead</div>
            <div className="text-[10px] text-[#64748B] leading-tight">Compliance & Risk</div>
          </div>
        </div>
      </div>
    </header>
  );
}
