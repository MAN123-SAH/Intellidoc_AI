"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from "lucide-react";
import { VerificationOutcome } from "@/types/intellidoc";

interface StatusBadgeProps {
  status?: VerificationOutcome | string | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const normalized = (status || "UNVERIFIED").toUpperCase().replace(/\s+/g, "_");

  let bg = "bg-slate-100";
  let text = "text-[#64748B]";
  let border = "border-slate-200";
  let label = "UNVERIFIED";
  let Icon = HelpCircle;

  if (normalized === "VERIFIED" || normalized === "PASS") {
    bg = "bg-[#159B83]/10";
    text = "text-[#159B83]";
    border = "border-[#159B83]/30";
    label = "VERIFIED";
    Icon = CheckCircle2;
  } else if (normalized === "REQUIRES_REVIEW" || normalized === "REVIEW" || normalized === "WARNING") {
    bg = "bg-[#D69A38]/10";
    text = "text-[#D69A38]";
    border = "border-[#D69A38]/30";
    label = "REQUIRES REVIEW";
    Icon = AlertTriangle;
  } else if (normalized === "UNVERIFIABLE" || normalized === "INCONCLUSIVE" || normalized === "UNAVAILABLE") {
    bg = "bg-slate-100";
    text = "text-[#64748B]";
    border = "border-[#DCE3EA]";
    label = "UNVERIFIABLE";
    Icon = HelpCircle;
  } else if (normalized === "CONFLICT" || normalized === "FAIL" || normalized === "ERROR") {
    bg = "bg-[#C65B5B]/10";
    text = "text-[#C65B5B]";
    border = "border-[#C65B5B]/30";
    label = "CONFLICT";
    Icon = XCircle;
  } else if (normalized === "PENDING" || normalized === "PROCESSING") {
    bg = "bg-blue-50";
    text = "text-blue-700";
    border = "border-blue-200";
    label = "PROCESSING";
    Icon = HelpCircle;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm font-medium gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses[size]} ${bg} ${text} ${border}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
