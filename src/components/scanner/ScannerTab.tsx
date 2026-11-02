"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Camera, UploadCloud, Loader2 } from "lucide-react";
import { ImageDropScanner } from "./ImageDropScanner";
import { ScanResultCard } from "./ScanResultCard";
import { ScanHistory } from "./ScanHistory";
import { detectQrType } from "@/utils/qr-parser";
import {
  getStoredHistory,
  addStoredHistoryItem,
  removeStoredHistoryItem,
  clearStoredHistory,
} from "@/utils/storage";
import { QrParseResult, ScanHistoryItem } from "@/types";

// CameraScanner dynamically loaded with ssr: false to prevent any server-side reference errors
const CameraScanner = dynamic(
  () => import("./CameraScanner").then((mod) => mod.CameraScanner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-h-[420px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-xs">Initializing camera engine...</span>
      </div>
    ),
  }
);

interface ScannerTabProps {
  active: boolean;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({ active }) => {
  const [scanMode, setScanMode] = useState<"camera" | "upload">("camera");
  const [currentResult, setCurrentResult] = useState<QrParseResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Load history from localStorage safely on mount
  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const handleScanSuccess = (rawText: string) => {
    if (!rawText) return;
    const parsed = detectQrType(rawText);
    setCurrentResult(parsed);

    // Save to history
    const updated = addStoredHistoryItem({
      text: parsed.raw,
      type: parsed.type,
    });
    setHistory(updated);
  };

  const handleHistorySelect = (item: ScanHistoryItem) => {
    const parsed = detectQrType(item.text);
    setCurrentResult(parsed);
  };

  const handleHistoryDelete = (id: string) => {
    const updated = removeStoredHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearStoredHistory();
    setHistory([]);
  };

  const handleScanAgain = () => {
    setCurrentResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* If there is a current scan result, prominently display it */}
      {currentResult ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <ScanResultCard result={currentResult} onScanAgain={handleScanAgain} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub-tab Mode Switcher: Camera vs Image File */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 max-w-xs mx-auto">
            <button
              onClick={() => setScanMode("camera")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                scanMode === "camera"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setScanMode("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                scanMode === "upload"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>
          </div>

          {/* Mode View: Camera or Upload */}
          {scanMode === "camera" ? (
            <CameraScanner onScanSuccess={handleScanSuccess} active={active && !currentResult} />
          ) : (
            <ImageDropScanner onScanSuccess={handleScanSuccess} />
          )}
        </div>
      )}

      {/* Recent Scans History Drawer */}
      <ScanHistory
        items={history}
        onSelectItem={handleHistorySelect}
        onDeleteItem={handleHistoryDelete}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

