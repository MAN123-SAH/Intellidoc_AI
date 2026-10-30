"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "verified" | "review" | "unverifiable" | "conflict";
}

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  variant = "default",
}: MetricCardProps) {
  let accentColor = "text-[#111C2D]";
  let iconBg = "bg-slate-100 text-[#243A52]";

  if (variant === "verified") {
    accentColor = "text-[#159B83]";
    iconBg = "bg-[#159B83]/10 text-[#159B83]";
  } else if (variant === "review") {
    accentColor = "text-[#D69A38]";
    iconBg = "bg-[#D69A38]/10 text-[#D69A38]";
  } else if (variant === "unverifiable") {
    accentColor = "text-[#64748B]";
    iconBg = "bg-slate-100 text-[#64748B]";
  } else if (variant === "conflict") {
    accentColor = "text-[#C65B5B]";
    iconBg = "bg-[#C65B5B]/10 text-[#C65B5B]";
  }

  return (
    <div className="bg-white border border-[#DCE3EA] rounded-lg p-5 shadow-enterprise-sm transition-all hover:shadow-enterprise">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-md ${iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className={`mt-3 text-3xl font-semibold tracking-tight ${accentColor}`}>
        {value}
      </div>
      {description && (
        <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
