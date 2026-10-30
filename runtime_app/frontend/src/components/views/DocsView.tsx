"use client";

import React from "react";
import { 
  BookOpen, 
  Layers, 
  Sparkles, 
  Scale, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  Cpu,
  Database
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function DocsView() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Help & System Architecture Documentation"
        subtitle="Complete technical reference manual for the 4-stage explainable multimodal document intelligence pipeline."
      />

      {/* 4 Pipeline Stages */}
      <div className="space-y-4">
        {/* Stage 1 */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172334]">
            <span className="w-6 h-6 rounded bg-[#111C2D] text-white flex items-center justify-center text-xs font-mono">1</span>
            <span>Stage 1: Offline Research & LayoutLMv3 Token Classifier Fine-Tuning</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Trained on the FUNSD (Form Understanding in Noisy Scanned Documents) dataset with multimodal visual attention + spatial 2D bounding boxes. Checkpoint saved at <code className="bg-[#F7F8FA] px-1 py-0.5 rounded font-mono text-[#172334]">offline_research/checkpoints/layoutlmv3_funsd/final_model/</code> (501 MB).
          </p>
        </div>

        {/* Stage 2 */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172334]">
            <span className="w-6 h-6 rounded bg-[#159B83] text-white flex items-center justify-center text-xs font-mono">2</span>
            <span>Stage 2: Multimodal Perception & Structured Claim Store</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Combines Tesseract v5.5 OCR word tokenization with LayoutLMv3 semantic classification (<code className="text-blue-600">header</code>, <code className="text-[#159B83]">question</code>, <code className="text-[#D69A38]">answer</code>, <code className="text-slate-600">other</code>) and Gemini 2.5 structured claim extraction into PostgreSQL tables.
          </p>
        </div>

        {/* Stage 3 */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172334]">
            <span className="w-6 h-6 rounded bg-[#D69A38] text-white flex items-center justify-center text-xs font-mono">3</span>
            <span>Stage 3: Deterministic Rule Engine (Zero-Hallucination)</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Extracts claims without verifying them, then independently audits: (1) Line items quantity × unit price = line total; (2) Sum of line totals = subtotal; (3) Subtotal + tax + shipping = invoice total; (4) Invoice date &lt;= due date; (5) Vendor active in authority registry; (6) Purchase Order cross-document reconciliation.
          </p>
        </div>

        {/* Stage 4 */}
        <div className="bg-white border border-[#DCE3EA] rounded-xl p-5 shadow-enterprise-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172334]">
            <span className="w-6 h-6 rounded bg-[#243A52] text-white flex items-center justify-center text-xs font-mono">4</span>
            <span>Stage 4: Custom Ground-Truth Evaluation Benchmark</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Evaluates 9 ground-truth scenarios across 11 test document images with 100% accuracy, 100% precision, 100% recall, and 0.0% LLM math hallucination.
          </p>
        </div>
      </div>
    </div>
  );
}
