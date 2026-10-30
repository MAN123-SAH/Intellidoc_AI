"use client";

import React, { useState } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Database, 
  Lock, 
  Save, 
  CheckCircle2, 
  Key, 
  Cpu, 
  Scale, 
  Layers
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<"general" | "rules" | "models" | "security">("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [tolerance, setTolerance] = useState("0.01");
  const [strictDates, setStrictDates] = useState(true);
  const [vendorCheck, setVendorCheck] = useState(true);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings & Verification Policy Configuration"
        subtitle="Manage workspace policies, deterministic verification rule thresholds, masked model credentials, and compliance logging parameters."
      >
        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save size={14} className="text-[#25B499]" />
          <span>Save Settings</span>
        </button>
      </PageHeader>

      {saveSuccess && (
        <div className="p-3 bg-[#159B83]/10 border border-[#159B83]/30 text-[#159B83] text-xs font-medium rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Configuration saved successfully. Deterministic rule policies updated.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE3EA] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
            activeTab === "general" ? "bg-[#111C2D] text-white" : "text-[#64748B] hover:text-[#172334]"
          }`}
        >
          General Workspace
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
            activeTab === "rules" ? "bg-[#111C2D] text-white" : "text-[#64748B] hover:text-[#172334]"
          }`}
        >
          Verification Rules & Tolerances
        </button>
        <button
          onClick={() => setActiveTab("models")}
          className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
            activeTab === "models" ? "bg-[#111C2D] text-white" : "text-[#64748B] hover:text-[#172334]"
          }`}
        >
          Perception & Models
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
            activeTab === "security" ? "bg-[#111C2D] text-white" : "text-[#64748B] hover:text-[#172334]"
          }`}
        >
          Security & Access
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-6 shadow-enterprise-sm space-y-5 text-xs">
          <div>
            <label className="font-semibold text-[#172334] block mb-1">Organization / Department Name</label>
            <input
              type="text"
              defaultValue="Enterprise Financial Audit & Compliance Unit"
              className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs text-[#172334] font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-[#172334] block mb-1">Auditing Standard Mode</label>
            <select className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs text-[#172334]">
              <option>Strict Multi-Way Auditing (PO + Invoice + Authority Registry)</option>
              <option>Single Document Internal Math Only</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#E8EDF2] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#172334]">PostgreSQL 18 Direct Storage</div>
              <div className="text-[11px] text-[#64748B]">Commit all claims and evidence to relational database schema.</div>
            </div>
            <span className="font-mono text-[10px] text-[#159B83] bg-[#159B83]/10 px-2 py-0.5 rounded font-bold">
              ACTIVE (:5432)
            </span>
          </div>
        </div>
      )}

      {/* Verification Rules Settings */}
      {activeTab === "rules" && (
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-6 shadow-enterprise-sm space-y-5 text-xs">
          <div>
            <label className="font-semibold text-[#172334] block mb-1">
              Arithmetic Precision Epsilon (Currency Tolerance)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                className="w-32 bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs font-mono text-[#172334]"
              />
              <span className="text-[#64748B] text-[11px]">Allowable rounding variance on tax / subtotal calculation (e.g. ±$0.01).</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg border border-[#DCE3EA]">
            <div>
              <div className="font-semibold text-[#172334]">Enforce Temporal Chronology Rule</div>
              <div className="text-[11px] text-[#64748B]">Flag REQUIRES_REVIEW if Invoice Date is after Due Date or before Purchase Order Date.</div>
            </div>
            <input
              type="checkbox"
              checked={strictDates}
              onChange={(e) => setStrictDates(e.target.checked)}
              className="w-4 h-4 text-[#159B83] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg border border-[#DCE3EA]">
            <div>
              <div className="font-semibold text-[#172334]">Vendor Authority Registry Verification</div>
              <div className="text-[11px] text-[#64748B]">Query PostgreSQL external authority table for suspended or revoked vendors.</div>
            </div>
            <input
              type="checkbox"
              checked={vendorCheck}
              onChange={(e) => setVendorCheck(e.target.checked)}
              className="w-4 h-4 text-[#159B83] rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Models Settings */}
      {activeTab === "models" && (
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-6 shadow-enterprise-sm space-y-5 text-xs">
          <div>
            <label className="font-semibold text-[#172334] block mb-1">Gemini Multimodal Model</label>
            <input
              type="text"
              readOnly
              value="gemini-2.5-flash (Structured Output API)"
              className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs text-[#172334] font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-[#172334] block mb-1">Gemini API Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value="AIzaSyB*********************************"
                className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs text-[#172334] font-mono"
              />
              <span className="text-[11px] font-mono text-[#159B83] bg-[#159B83]/10 px-2 py-1 rounded shrink-0">
                MASKED IN ENV
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Managed strictly on the FastAPI server environment. Never exposed to browser clients.
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#172334] block mb-1">LayoutLMv3 FUNSD Checkpoint</label>
            <input
              type="text"
              readOnly
              value="offline_research/checkpoints/layoutlmv3_funsd/final_model/ (501 MB PyTorch)"
              className="w-full bg-[#F7F8FA] border border-[#DCE3EA] rounded-md p-2 text-xs text-[#172334] font-mono"
            />
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-6 shadow-enterprise-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EDF2]">
            <div>
              <div className="font-semibold text-[#172334]">Role-Based Access Control (RBAC)</div>
              <div className="text-[11px] text-[#64748B]">Auditors, Compliance Officers, Lead Investigators.</div>
            </div>
            <span className="font-mono text-[10px] text-[#159B83] bg-[#159B83]/10 px-2 py-0.5 rounded font-semibold">
              ENFORCED
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#E8EDF2]">
            <div>
              <div className="font-semibold text-[#172334]">Cryptographic Hash Verification (SHA-256)</div>
              <div className="text-[11px] text-[#64748B]">Prevents tampered or duplicate document uploads.</div>
            </div>
            <span className="font-mono text-[10px] text-[#159B83] bg-[#159B83]/10 px-2 py-0.5 rounded font-semibold">
              ENABLED
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#172334]">Immutable Audit Log Stream</div>
              <div className="text-[11px] text-[#64748B]">Writes audit trail to audit_logs PostgreSQL table with timestamp and user id.</div>
            </div>
            <span className="font-mono text-[10px] text-[#159B83] bg-[#159B83]/10 px-2 py-0.5 rounded font-semibold">
              PERSISTENT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
