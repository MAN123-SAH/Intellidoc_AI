"use client";

import React, { useState, useEffect } from "react";
import AppSidebar, { ViewKey } from "@/components/layout/AppSidebar";
import TopNavigation from "@/components/layout/TopNavigation";

// Views
import CommandCenterView from "@/components/views/CommandCenterView";
import DocumentIntakeView from "@/components/views/DocumentIntakeView";
import DocumentLibraryView from "@/components/views/DocumentLibraryView";
import IntelligenceStudioView from "@/components/views/IntelligenceStudioView";
import VerificationWorkbenchView from "@/components/views/VerificationWorkbenchView";
import ForensicAnalysisView from "@/components/views/ForensicAnalysisView";
import EvidenceAuditCenterView from "@/components/views/EvidenceAuditCenterView";
import HumanReviewQueueView from "@/components/views/HumanReviewQueueView";
import ModelObservatoryView from "@/components/views/ModelObservatoryView";
import SettingsView from "@/components/views/SettingsView";
import DocsView from "@/components/views/DocsView";

// Types & API
import { DocumentItem, ClaimItem, FullVerificationData } from "@/types/intellidoc";
import { 
  fetchDocuments, 
  fetchClaims, 
  fetchVerification, 
  triggerPerceptionPipeline, 
  extractClaimsWithGemini, 
  triggerVerification, 
  deleteDocumentById,
  fetchHealth
} from "@/lib/api";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewKey>("command_center");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [verificationData, setVerificationData] = useState<FullVerificationData | null>(null);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pipeline Async Loaders
  const [processingPerception, setProcessingPerception] = useState<boolean>(false);
  const [extractingClaims, setExtractingClaims] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const notify = (message: string, type: "success" | "info" | "error" = "info", duration = 5000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Initial Data Load
  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
      setBackendOnline(true);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setBackendOnline(false);
      notify("FastAPI backend unreachable on http://127.0.0.1:8000", "error");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    fetchHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  // When selected document changes, reload its claims and verification data
  useEffect(() => {
    if (selectedDoc) {
      setActivePageNum(1);
      setSelectedClaim(null);

      // Load claims
      fetchClaims(selectedDoc.id)
        .then((c) => setClaims(c))
        .catch(() => setClaims([]));

      // Load verification
      fetchVerification(selectedDoc.id)
        .then((v) => setVerificationData(v))
        .catch(() => setVerificationData(null));
    } else {
      setClaims([]);
      setVerificationData(null);
    }
  }, [selectedDoc?.id]);

  // Handler: Run Perception
  const handleRunPerception = async (docId: string) => {
    setProcessingPerception(true);
    notify("Running Tesseract OCR & fine-tuned LayoutLMv3 token classifier...", "info", 8000);
    try {
      const updated = await triggerPerceptionPipeline(docId);
      notify("Perception pipeline completed! Layout tokens classified.", "success");
      // Update local doc
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    } catch (err: any) {
      notify(`Perception failed: ${err.message}`, "error");
    } finally {
      setProcessingPerception(false);
    }
  };

  // Handler: Extract Claims with Gemini
  const handleExtractClaims = async (docId: string) => {
    setExtractingClaims(true);
    notify("Extracting structured business claims via Gemini 2.5 Multimodal...", "info", 10000);
    try {
      const res = await extractClaimsWithGemini(docId);
      notify(`Extracted ${res.claims_count} factual claims to PostgreSQL!`, "success");
      setClaims(res.claims || []);
      // Refresh verification
      const v = await fetchVerification(docId);
      setVerificationData(v);
    } catch (err: any) {
      notify(`Extraction failed: ${err.message}`, "error");
    } finally {
      setExtractingClaims(false);
    }
  };

  // Handler: Run Verification
  const handleVerifyDocument = async (docId: string) => {
    setVerifying(true);
    notify("Running zero-hallucination arithmetic, date & registry verification...", "info", 8000);
    try {
      const result = await triggerVerification(docId);
      notify(`Verification complete: ${result.decision.toUpperCase().replace("_", " ")}`, "success");
      setVerificationData(result);
      // Reload document list to update decision status badge
      const updatedDocs = await fetchDocuments();
      setDocuments(updatedDocs);
      const cur = updatedDocs.find((d) => d.id === docId);
      if (cur) setSelectedDoc(cur);
    } catch (err: any) {
      notify(`Verification error: ${err.message}`, "error");
    } finally {
      setVerifying(false);
    }
  };

  // Handler: Delete Document
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document from the repository?")) return;
    try {
      await deleteDocumentById(docId);
      notify("Document removed from repository.", "info");
      const updated = await fetchDocuments();
      setDocuments(updated);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated[0] || null);
      }
    } catch (err: any) {
      notify(`Failed to delete document: ${err.message}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* 1. Fixed Left Sidebar */}
      <AppSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        documentsCount={documents.length}
        backendOnline={backendOnline}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <TopNavigation
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUploadClick={() => setCurrentView("intake")}
          documentsCount={documents.length}
        />

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-8 z-50 transition-all transform animate-in slide-in-from-top-2">
            <div
              className={`px-4 py-3 rounded-lg shadow-enterprise-md text-xs font-medium flex items-center gap-2 border ${
                toast.type === "success"
                  ? "bg-[#159B83] text-white border-[#12816D]"
                  : toast.type === "error"
                  ? "bg-[#C65B5B] text-white border-[#A84949]"
                  : "bg-[#111C2D] text-white border-[#243A52]"
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* View Content Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          {currentView === "command_center" && (
            <CommandCenterView
              documents={documents}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === "intake" && (
            <DocumentIntakeView
              onDocumentUploaded={(newDoc) => {
                setDocuments((prev) => [newDoc, ...prev]);
                setSelectedDoc(newDoc);
                notify(`"${newDoc.original_filename}" ingested successfully!`, "success");
              }}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === "library" && (
            <DocumentLibraryView
              documents={documents}
              loading={loadingDocs}
              onRefresh={loadDocuments}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onDeleteDocument={handleDeleteDocument}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === "studio" && (
            <IntelligenceStudioView
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              claims={claims}
              selectedClaim={selectedClaim}
              onSelectClaim={(claim) => setSelectedClaim(claim)}
              verificationData={verificationData}
              activePageNum={activePageNum}
              onPageChange={(p) => setActivePageNum(p)}
              onRunPerception={handleRunPerception}
              onExtractClaims={handleExtractClaims}
              onVerifyDocument={handleVerifyDocument}
              processingPerception={processingPerception}
              extractingClaims={extractingClaims}
              verifying={verifying}
            />
          )}

          {currentView === "workbench" && (
            <VerificationWorkbenchView documents={documents} />
          )}

          {currentView === "forensics" && (
            <ForensicAnalysisView
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {currentView === "audit_center" && (
            <EvidenceAuditCenterView
              documents={documents}
              selectedDoc={selectedDoc}
              verificationData={verificationData}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {currentView === "review_queue" && (
            <HumanReviewQueueView onNavigate={(view) => setCurrentView(view)} />
          )}

          {currentView === "observatory" && (
            <ModelObservatoryView />
          )}

          {currentView === "settings" && (
            <SettingsView />
          )}

          {currentView === "docs" && (
            <DocsView />
          )}
        </main>
      </div>
    </div>
  );
}
