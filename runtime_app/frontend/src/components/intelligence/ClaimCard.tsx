"use client";

import React, { useState } from "react";
import { 
  FileText, 
  DollarSign, 
  ListOrdered, 
  Search, 
  Sparkles, 
  Tag, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { ClaimItem } from "@/types/intellidoc";
import StatusBadge from "@/components/ui/StatusBadge";

interface ClaimsListProps {
  claims: ClaimItem[];
  selectedClaim: ClaimItem | null;
  onSelectClaim: (claim: ClaimItem) => void;
  onExtractClaims: () => void;
  extracting: boolean;
}

export default function ClaimsList({
  claims,
  selectedClaim,
  onSelectClaim,
  onExtractClaims,
  extracting,
}: ClaimsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "INFO" | "FINANCIAL" | "LINE_ITEMS">("ALL");

  // Categorize claims
  const documentInfoFields = ["invoice_number", "invoice_date", "due_date", "vendor_name", "vendor_address", "customer_name", "customer_address", "po_reference", "payment_terms"];
  const financialFields = ["invoice_subtotal", "invoice_tax", "tax_rate", "invoice_shipping", "invoice_total", "currency", "discount"];

  const categorizedClaims = claims.map((c) => {
    let cat: "INFO" | "FINANCIAL" | "LINE_ITEMS" = "INFO";
    if (financialFields.includes(c.field.toLowerCase())) {
      cat = "FINANCIAL";
    } else if (c.field.toLowerCase().startsWith("item_") || c.field.toLowerCase().includes("line")) {
      cat = "LINE_ITEMS";
    }
    return { ...c, category: cat };
  });

  const filtered = categorizedClaims.filter((c) => {
    const matchesSearch = c.field.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "ALL" || c.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#DCE3EA] bg-[#F7F8FA]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-[#243A52]" />
            <h3 className="text-xs font-semibold text-[#172334] uppercase tracking-wider">
              Extracted Claims Store
            </h3>
            <span className="text-[10px] bg-[#E8EDF2] text-[#243A52] px-2 py-0.5 rounded-full font-mono font-semibold">
              {claims.length} Claims
            </span>
          </div>

          <button
            onClick={onExtractClaims}
            disabled={extracting}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#111C2D] hover:bg-[#243A52] rounded shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className={extracting ? "animate-spin" : ""} />
            <span>{extracting ? "Extracting..." : "Re-Extract (Gemini)"}</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search extracted fields or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#DCE3EA] rounded-md pl-8 pr-3 py-1 text-xs text-[#172334] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#111C2D]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setFilterCategory("ALL")}
              className={`px-2.5 py-0.5 rounded-md font-medium cursor-pointer ${
                filterCategory === "ALL" ? "bg-[#111C2D] text-white" : "bg-[#E8EDF2] text-[#64748B] hover:text-[#172334]"
              }`}
            >
              All ({claims.length})
            </button>
            <button
              onClick={() => setFilterCategory("INFO")}
              className={`px-2.5 py-0.5 rounded-md font-medium cursor-pointer ${
                filterCategory === "INFO" ? "bg-[#111C2D] text-white" : "bg-[#E8EDF2] text-[#64748B] hover:text-[#172334]"
              }`}
            >
              Doc Info
            </button>
            <button
              onClick={() => setFilterCategory("FINANCIAL")}
              className={`px-2.5 py-0.5 rounded-md font-medium cursor-pointer ${
                filterCategory === "FINANCIAL" ? "bg-[#111C2D] text-white" : "bg-[#E8EDF2] text-[#64748B] hover:text-[#172334]"
              }`}
            >
              Financials
            </button>
            <button
              onClick={() => setFilterCategory("LINE_ITEMS")}
              className={`px-2.5 py-0.5 rounded-md font-medium cursor-pointer ${
                filterCategory === "LINE_ITEMS" ? "bg-[#111C2D] text-white" : "bg-[#E8EDF2] text-[#64748B] hover:text-[#172334]"
              }`}
            >
              Line Items
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E8EDF2]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            {claims.length === 0 ? (
              <div>
                <p>No claims extracted yet for this document.</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Click "Re-Extract (Gemini)" to run multimodal claim extraction.</p>
              </div>
            ) : (
              "No claims match your search filter."
            )}
          </div>
        ) : (
          filtered.map((claim) => {
            const isSelected = selectedClaim?.id === claim.id;
            return (
              <div
                key={claim.id}
                onClick={() => onSelectClaim(claim)}
                className={`p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected ? "bg-[#159B83]/10 border-l-4 border-l-[#159B83]" : "hover:bg-[#F7F8FA]"
                }`}
              >
                <div className="flex-1 pr-3 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-[#172334] truncate">
                      {claim.field}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono bg-[#E8EDF2] px-1.5 py-0.2 rounded">
                      {claim.data_type}
                    </span>
                  </div>
                  <div className="text-xs text-[#172334] font-medium truncate" title={claim.value}>
                    {claim.value}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={claim.verification_status} size="sm" />
                  <ChevronRight size={14} className={isSelected ? "text-[#159B83]" : "text-[#CBD5E1]"} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Note */}
      <div className="p-3 bg-[#F7F8FA] border-t border-[#DCE3EA] text-[11px] text-[#64748B] flex items-center justify-between">
        <span>Extraction != Verification</span>
        <span className="font-mono text-[10px] text-[#159B83]">Gemini 2.5 Flash</span>
      </div>
    </div>
  );
}
