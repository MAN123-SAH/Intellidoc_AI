"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-[#DCE3EA]">
      <div>
        <h2 className="text-xl font-semibold text-[#172334] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
