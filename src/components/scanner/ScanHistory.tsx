"use client";

import React, { useState } from "react";
import { History, Trash2, Copy, Check, Globe, Wifi, Mail, Phone, FileText, ChevronRight } from "lucide-react";
import { ScanHistoryItem } from "@/types";

interface ScanHistoryProps {
  items: ScanHistoryItem[];
  onSelectItem: (item: ScanHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  items,
  onSelectItem,
  onDeleteItem,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error("Failed to copy history item", err);
    }
  };

  const getIcon = (type: ScanHistoryItem["type"]) => {
    switch (type) {
      case "url":
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
      case "wifi":
        return <Wifi className="w-3.5 h-3.5 text-emerald-500" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-purple-500" />;
      case "phone":
        return <Phone className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTime = (ts: number) => {
    try {
      const diffMs = Date.now() - ts;
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(ts).toLocaleDateString();
    } catch {
      return "";
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Recent Scans ({items.length}/10)
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Clear all stored scan history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear history</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.text}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <span className="capitalize">{item.type}</span>
                  <span>•</span>
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleCopy(item.id, item.text, e)}
                title="Copy text"
                aria-label="Copy text"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
                title="Delete item"
                aria-label="Delete item from history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
