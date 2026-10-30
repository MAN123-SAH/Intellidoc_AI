"use client";

import React from "react";
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  GitCompare, 
  ClipboardCheck, 
  Layers, 
  ScanLine, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export type ViewKey = 
  | "command_center"
  | "intake"
  | "library"
  | "studio"
  | "workbench"
  | "forensics"
  | "audit_center"
  | "review_queue"
  | "observatory"
  | "settings"
  | "docs";

interface AppSidebarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  reviewCasesCount?: number;
  documentsCount?: number;
  backendOnline?: boolean;
}

export default function AppSidebar({
  currentView,
  onNavigate,
  reviewCasesCount = 3,
  documentsCount = 12,
  backendOnline = true,
}: AppSidebarProps) {
  const workspaceItems = [
    { key: "command_center" as ViewKey, label: "Command Center", icon: LayoutDashboard },
    { key: "intake" as ViewKey, label: "Document Intake", icon: UploadCloud },
    { key: "library" as ViewKey, label: "Document Library", icon: FileText, badge: documentsCount },
    { key: "workbench" as ViewKey, label: "Verification Workbench", icon: GitCompare },
    { key: "review_queue" as ViewKey, label: "Human Review Queue", icon: ClipboardCheck, alertBadge: reviewCasesCount },
  ];

  const intelligenceItems = [
    { key: "studio" as ViewKey, label: "Document Intelligence Studio", icon: Layers, highlight: true },
    { key: "forensics" as ViewKey, label: "Forensic Analysis", icon: ScanLine },
    { key: "audit_center" as ViewKey, label: "Evidence & Audit Center", icon: ShieldCheck },
    { key: "observatory" as ViewKey, label: "Model Observatory", icon: Cpu },
  ];

  const systemItems = [
    { key: "settings" as ViewKey, label: "Settings", icon: Sliders },
    { key: "docs" as ViewKey, label: "Help & Documentation", icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-[#111C2D] text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 select-none border-r border-[#1E2E44]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2E44] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#159B83] to-[#25B499] flex items-center justify-center text-white font-bold shadow-md">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
              <span>IntelliDoc AI</span>
              <span className="text-[10px] bg-[#159B83]/20 text-[#25B499] border border-[#159B83]/40 px-1.5 py-0.2 rounded font-mono">v2.1</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">
              Evidence Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Workspace */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>
          <div className="space-y-0.5">
            {workspaceItems.map((item) => {
              const active = currentView === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#243A52] text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-[#18263A] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={active ? "text-[#25B499]" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] bg-[#1E2E44] text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge !== undefined && item.alertBadge > 0 && (
                    <span className="text-[10px] bg-[#D69A38]/20 text-[#E0A84D] border border-[#D69A38]/30 px-1.5 py-0.5 rounded-full font-mono">
                      {item.alertBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Intelligence</span>
            <span className="text-[9px] text-[#25B499] uppercase tracking-normal font-mono font-medium">Explainable</span>
          </div>
          <div className="space-y-0.5">
            {intelligenceItems.map((item) => {
              const active = currentView === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#243A52] text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-[#18263A] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={active ? "text-[#25B499]" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-[#159B83]" title="Signature Workspace" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* System */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            System
          </div>
          <div className="space-y-0.5">
            {systemItems.map((item) => {
              const active = currentView === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#243A52] text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-[#18263A] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={active ? "text-[#25B499]" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backend Engine Live Indicator */}
      <div className="p-3.5 border-t border-[#1E2E44] bg-[#0C1523]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-[#159B83] animate-pulse" : "bg-red-500"}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              FastAPI :8000
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            {backendOnline ? "ONLINE" : "DISCONNECTED"}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
          <span>PostgreSQL 18</span>
          <span className="text-[#25B499]">Dual Interface (0.0.0.0)</span>
        </div>
      </div>
    </aside>
  );
}
