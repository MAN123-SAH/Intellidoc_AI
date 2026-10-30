"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Hash,
  Eye,
  FileText
} from "lucide-react";
import { DocumentItem, PageItem, OCRRegion, ClaimItem } from "@/types/intellidoc";
import { getPageImageUrl } from "@/lib/api";

interface DocumentViewerProps {
  document: DocumentItem | null;
  activePageNum: number;
  onPageChange: (pageNum: number) => void;
  selectedClaim: ClaimItem | null;
  onRegionClick?: (region: OCRRegion) => void;
  hoveredRegion: OCRRegion | null;
  setHoveredRegion: (region: OCRRegion | null) => void;
}

export default function DocumentViewer({
  document,
  activePageNum,
  onPageChange,
  selectedClaim,
  onRegionClick,
  hoveredRegion,
  setHoveredRegion,
}: DocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [displayedSize, setDisplayedSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const activePage: PageItem | undefined = document?.pages?.find(
    (p) => p.page_number === activePageNum
  ) || document?.pages?.[0];

  const totalPages = document?.page_count || document?.pages?.length || 1;

  // Track image rendered dimensions for bounding box scaling
  const updateDisplayedDimensions = () => {
    if (imgRef.current) {
      setDisplayedSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    updateDisplayedDimensions();
    window.addEventListener("resize", updateDisplayedDimensions);
    return () => window.removeEventListener("resize", updateDisplayedDimensions);
  }, [zoomLevel, rotation, activePage?.id]);

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white border border-[#DCE3EA] rounded-xl text-center">
        <FileText size={36} className="text-[#94A3B8] mb-3" />
        <h4 className="text-sm font-semibold text-[#172334]">No Document Selected</h4>
        <p className="text-xs text-[#64748B] mt-1 max-w-xs">
          Select a document from the library or intake queue to inspect high-resolution visual layout tokens.
        </p>
      </div>
    );
  }

  const imageUrl = getPageImageUrl(document.id, activePageNum);

  // Helper to scale bounding box
  const getBoxStyle = (bbox: number[]) => {
    if (!naturalSize.width || !naturalSize.height || !displayedSize.width || !displayedSize.height) {
      return { display: "none" };
    }

    const scaleX = displayedSize.width / naturalSize.width;
    const scaleY = displayedSize.height / naturalSize.height;

    // bbox format: [x0, y0, x1, y1]
    const [x0, y0, x1, y1] = bbox;
    const left = x0 * scaleX;
    const top = y0 * scaleY;
    const width = Math.max((x1 - x0) * scaleX, 4);
    const height = Math.max((y1 - y0) * scaleY, 4);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const getTagColor = (label?: string) => {
    switch (label?.toLowerCase()) {
      case "header":
        return "border-blue-500 bg-blue-500/15 text-blue-900";
      case "question":
        return "border-[#159B83] bg-[#159B83]/15 text-[#159B83]";
      case "answer":
        return "border-[#D69A38] bg-[#D69A38]/15 text-[#D69A38]";
      default:
        return "border-slate-400 bg-slate-400/10 text-slate-700";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#DCE3EA] rounded-xl overflow-hidden shadow-enterprise-sm">
      {/* Viewer Toolbar */}
      <div className="h-12 bg-[#F7F8FA] border-b border-[#DCE3EA] px-4 flex items-center justify-between text-xs select-none">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, activePageNum - 1))}
            disabled={activePageNum <= 1}
            className="p-1 rounded hover:bg-[#E8EDF2] disabled:opacity-30 disabled:cursor-not-allowed text-[#172334] cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium text-[#172334] font-mono text-[11px]">
            Page {activePageNum} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, activePageNum + 1))}
            disabled={activePageNum >= totalPages}
            className="p-1 rounded hover:bg-[#E8EDF2] disabled:opacity-30 disabled:cursor-not-allowed text-[#172334] cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: Layer Toggle */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCE3EA] rounded-md px-2 py-1">
          <Layers size={13} className="text-[#243A52]" />
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`text-[11px] font-medium cursor-pointer ${
              showBoundingBoxes ? "text-[#159B83] font-semibold" : "text-[#64748B]"
            }`}
          >
            {showBoundingBoxes ? "LayoutLMv3 Tokens (ON)" : "LayoutLMv3 (OFF)"}
          </button>
        </div>

        {/* Right: Zoom & Orientation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded hover:bg-[#E8EDF2] text-[#172334] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono w-10 text-center text-[#64748B]">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded hover:bg-[#E8EDF2] text-[#172334] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <div className="h-4 w-px bg-[#DCE3EA] mx-1" />
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded hover:bg-[#E8EDF2] text-[#172334] cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setRotation(0);
            }}
            className="p-1.5 rounded hover:bg-[#E8EDF2] text-[#172334] cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#ECEFF3] p-4 flex items-center justify-center relative select-none"
      >
        <div 
          className="relative shadow-enterprise-md transition-transform duration-100 ease-out bg-white"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Document Rasterized Image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt={`Document Page ${activePageNum}`}
            onLoad={(e) => {
              const target = e.currentTarget;
              setNaturalSize({ width: target.naturalWidth, height: target.naturalHeight });
              updateDisplayedDimensions();
            }}
            className="max-w-[700px] h-auto block select-none pointer-events-none"
          />

          {/* Scaled OCR Bounding Boxes Overlay */}
          {showBoundingBoxes && activePage?.ocr_regions && (
            <div className="absolute inset-0 pointer-events-auto">
              {activePage.ocr_regions.map((region) => {
                const isHovered = hoveredRegion?.id === region.id;
                const isMatchingClaim = selectedClaim && selectedClaim.value && 
                  selectedClaim.value.toLowerCase().includes(region.text.toLowerCase());

                const boxStyle = getBoxStyle(region.bbox);
                const tagColorClass = getTagColor(region.layout_label);

                return (
                  <div
                    key={region.id}
                    style={boxStyle}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => onRegionClick && onRegionClick(region)}
                    className={`absolute border cursor-pointer transition-all ${tagColorClass} ${
                      isHovered ? "ring-2 ring-blue-500 z-20 scale-[1.03] shadow-md" : "z-10"
                    } ${
                      isMatchingClaim ? "ring-2 ring-[#159B83] bg-[#159B83]/30 font-bold z-30" : ""
                    }`}
                    title={`${region.text} [${region.layout_label || "token"}]`}
                  >
                    {/* Small layout label indicator on hover */}
                    {isHovered && (
                      <span className="absolute -top-4 left-0 text-[9px] bg-[#111C2D] text-white px-1 py-0.2 rounded shadow font-mono whitespace-nowrap z-40 pointer-events-none">
                        {region.layout_label || "token"} ({(region.ocr_confidence * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Viewer Footer Status */}
      <div className="h-9 bg-[#F7F8FA] border-t border-[#DCE3EA] px-4 flex items-center justify-between text-[11px] text-[#64748B]">
        <div className="flex items-center gap-3">
          <span>Dimensions: <strong className="font-mono text-[#172334]">{naturalSize.width} × {naturalSize.height} px</strong></span>
          <span>Tokens: <strong className="font-mono text-[#172334]">{activePage?.ocr_regions?.length || 0}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Header</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#159B83]" />
            <span>Question/Label</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D69A38]" />
            <span>Answer/Value</span>
          </div>
        </div>
      </div>
    </div>
  );
}
