"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Wifi,
  Mail,
  Phone,
  Globe,
  FileText,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { QrParseResult } from "@/types";

interface ScanResultCardProps {
  result: QrParseResult;
  onScanAgain: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onScanAgain }) => {
  const [copied, setCopied] = useState(false);
  const [wifiPassCopied, setWifiPassCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (textToCopy: string, isPassword = false) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      if (isPassword) {
        setWifiPassCopied(true);
        setTimeout(() => setWifiPassCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error("Failed to copy to clipboard", e);
    }
  };

  const getTypeMeta = () => {
    switch (result.type) {
      case "url":
        return {
          label: "Web Link (URL)",
          icon: Globe,
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        };
      case "wifi":
        return {
          label: "Wi-Fi Network",
          icon: Wifi,
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        };
      case "email":
        return {
          label: "Email Address",
          icon: Mail,
          badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        };
      case "phone":
        return {
          label: "Phone Number",
          icon: Phone,
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        };
      default:
        return {
          label: "Plain Text",
          icon: FileText,
          badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const meta = getTypeMeta();
  const IconComponent = meta.icon;
  const isHttpUrl =
    result.type === "url" &&
    result.url &&
    (result.url.startsWith("http://") || result.url.startsWith("https://"));

  return (
    <div
      aria-live="polite"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Header with Type Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.badgeColor}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            {meta.label}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {result.raw.length} chars
          </span>
        </div>
        <button
          onClick={onScanAgain}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Scan again</span>
        </button>
      </div>

      {/* Structured WiFi Details */}
      {result.type === "wifi" && result.parsedWifi && (
        <div className="mb-4 space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Network Name (SSID)
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white font-mono break-all">
              {result.parsedWifi.ssid}
            </div>
          </div>

          {result.parsedWifi.password && (
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-500 lowercase">
                  security: {result.parsedWifi.encryption || "WPA"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  readOnly
                  value={result.parsedWifi.password}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm w-full outline-none"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleCopy(result.parsedWifi?.password || "", true)}
                  title="Copy password"
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
                >
                  {wifiPassCopied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Structured Email Details */}
      {result.type === "email" && result.parsedEmail && (
        <div className="mb-4 space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium">To:</span>{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {result.parsedEmail.to}
            </span>
          </div>
          {result.parsedEmail.subject && (
            <div>
              <span className="text-xs text-slate-400 font-medium">Subject:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {result.parsedEmail.subject}
              </span>
            </div>
          )}
          {result.parsedEmail.body && (
            <div className="pt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans text-xs">
              {result.parsedEmail.body}
            </div>
          )}
        </div>
      )}

      {/* Decoded Raw Result Display */}
      <div className="relative mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 font-mono text-sm text-slate-800 dark:text-slate-200 break-all select-all max-h-48 overflow-y-auto leading-relaxed">
          {result.raw}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Copy Button */}
        <button
          onClick={() => handleCopy(result.raw)}
          className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied!" : "Copy Result"}</span>
        </button>

        {/* Open Link Button (Only if valid http/https URL) */}
        {isHttpUrl && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-sm transition-colors border border-slate-700/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Link</span>
          </a>
        )}

        {/* Tel link if phone */}
        {result.type === "phone" && result.parsedPhone && (
          <a
            href={`tel:${result.parsedPhone.phone}`}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Number</span>
          </a>
        )}

        {/* Mail link if email */}
        {result.type === "email" && (
          <a
            href={result.raw.startsWith("mailto:") ? result.raw : `mailto:${result.raw}`}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span>Compose Email</span>
          </a>
        )}
      </div>
    </div>
  );
};
