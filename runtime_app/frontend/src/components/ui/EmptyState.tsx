"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-[#DCE3EA] rounded-xl my-6">
      <div className="w-12 h-12 rounded-full bg-[#E8EDF2] flex items-center justify-center text-[#243A52] mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-[#172334] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#64748B] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-[#111C2D] hover:bg-[#243A52] rounded-md shadow-enterprise-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#111C2D]/20 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
