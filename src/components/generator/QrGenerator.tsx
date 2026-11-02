"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Wifi,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Palette,
  Sliders,
  ArrowRightLeft,
} from "lucide-react";
import {
  GeneratorType,
  ErrorCorrectionLevel,
  WifiFormData,
  EmailFormData,
} from "@/types";
import {
  buildWifiQrString,
  buildEmailQrString,
  buildPhoneQrString,
  calculateContrastRatio,
} from "@/utils/qr-parser";

const PRESET_PALETTES = [
  { name: "Classic", fg: "#000000", bg: "#ffffff" },
  { name: "Indigo", fg: "#4f46e5", bg: "#ffffff" },
  { name: "Dark Slate", fg: "#ffffff", bg: "#0f172a" },
  { name: "Forest", fg: "#065f46", bg: "#ecfdf5" },
  { name: "Crimson", fg: "#991b1b", bg: "#fef2f2" },
  { name: "Cyberpunk", fg: "#facc15", bg: "#18181b" },
];

export const QrGenerator: React.FC = () => {
  const [activeType, setActiveType] = useState<GeneratorType>("text");

  // Form states
  const [textVal, setTextVal] = useState("https://qrstudio.app");
  const [wifiData, setWifiData] = useState<WifiFormData>({
    ssid: "MyHomeWiFi",
    password: "SecurePassword123",
    encryption: "WPA",
    hidden: false,
  });
  const [showWifiPass, setShowWifiPass] = useState(false);

  const [emailData, setEmailData] = useState<EmailFormData>({
    to: "hello@example.com",
    subject: "Inquiry from QR Studio",
    body: "Hi there, I scanned your QR code!",
  });

  const [phoneVal, setPhoneVal] = useState("+1 555 019 2834");

  // Customization states
  const [size, setSize] = useState<number>(300);
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("M");

  // UI feedback states
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derive active payload string
  const qrPayload = useMemo(() => {
    switch (activeType) {
      case "text":
        return textVal.trim() || " ";
      case "wifi":
        return buildWifiQrString(wifiData);
      case "email":
        return buildEmailQrString(emailData);
      case "phone":
        return buildPhoneQrString(phoneVal);
      default:
        return textVal;
    }
  }, [activeType, textVal, wifiData, emailData, phoneVal]);

  // Calculate contrast ratio
  const contrastRatio = useMemo(() => {
    return calculateContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const isLowContrast = contrastRatio < 3.0;

  // Render QR to canvas whenever dependencies change
  useEffect(() => {
    if (!canvasRef.current) return;
    setErrorMsg(null);

    const canvas = canvasRef.current;
    QRCode.toCanvas(
      canvas,
      qrPayload,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err) => {
        if (err) {
          console.error("QRCode generation error:", err);
          setErrorMsg("Could not generate QR code. Content may exceed maximum QR data capacity.");
        }
      }
    );
  }, [qrPayload, size, fgColor, bgColor, ecLevel]);

  // Download PNG
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    try {
      setDownloading(true);
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `qr-code-${size}px.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download PNG", err);
    } finally {
      setDownloading(false);
    }
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    try {
      setDownloading(true);
      const svgString = await QRCode.toString(qrPayload, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `qr-code.svg`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export SVG", err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
          } else {
            alert("Copying images directly to clipboard is not supported in this browser. Please use the Download button.");
          }
        } catch (clipErr) {
          console.error("ClipboardItem write failed:", clipErr);
          alert("Could not copy image to clipboard. Please use the Download button.");
        }
      }, "image/png");
    } catch (err) {
      console.error("Copy image error:", err);
    }
  };

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 gap-1 max-w-xl mx-auto">
        <button
          onClick={() => setActiveType("text")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            activeType === "text"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Text / URL</span>
        </button>

        <button
          onClick={() => setActiveType("wifi")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            activeType === "wifi"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Wi-Fi</span>
        </button>

        <button
          onClick={() => setActiveType("email")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            activeType === "email"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </button>

        <button
          onClick={() => setActiveType("phone")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            activeType === "phone"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone</span>
        </button>
      </div>

      {/* Main Grid: Form / Options on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Design Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Content Input */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>QR Content</span>
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                (Updates preview automatically)
              </span>
            </h2>

            {/* Type 1: Text / URL */}
            {activeType === "text" && (
              <div className="space-y-2">
                <label
                  htmlFor="text-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Text or Web URL
                </label>
                <textarea
                  id="text-input"
                  rows={4}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="https://example.com or any plain text message..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Tip: Include https:// for web links</span>
                  <span>{textVal.length} chars</span>
                </div>
              </div>
            )}

            {/* Type 2: Wi-Fi */}
            {activeType === "wifi" && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="wifi-ssid"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Network Name (SSID)
                  </label>
                  <input
                    id="wifi-ssid"
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                    placeholder="e.g. Home_Network"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wifi-password"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="wifi-password"
                      type={showWifiPass ? "text" : "password"}
                      value={wifiData.password}
                      disabled={wifiData.encryption === "nopass"}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder={wifiData.encryption === "nopass" ? "No password needed" : "Network password"}
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-50"
                    />
                    {wifiData.encryption !== "nopass" && (
                      <button
                        type="button"
                        onClick={() => setShowWifiPass(!showWifiPass)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label={showWifiPass ? "Hide password" : "Show password"}
                      >
                        {showWifiPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="wifi-encryption"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Security Type
                    </label>
                    <select
                      id="wifi-encryption"
                      value={wifiData.encryption}
                      onChange={(e) =>
                        setWifiData({
                          ...wifiData,
                          encryption: e.target.value as "WPA" | "WEP" | "nopass",
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={wifiData.hidden}
                        onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Hidden Network</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Type 3: Email */}
            {activeType === "email" && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="email-recipient"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Recipient Email
                  </label>
                  <input
                    id="email-recipient"
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-subject"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Subject (Optional)
                  </label>
                  <input
                    id="email-subject"
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Subject line"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-body"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Message Body (Optional)
                  </label>
                  <textarea
                    id="email-body"
                    rows={2}
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    placeholder="Pre-filled message..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Type 4: Phone */}
            {activeType === "phone" && (
              <div className="space-y-2">
                <label
                  htmlFor="phone-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Phone Number
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Include country code (e.g. +1 for US/Canada, +44 for UK, +91 for India)
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Customization & Appearance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Design & Quality Options</span>
            </h2>

            {/* Color Palette Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                      style={{ backgroundColor: p.fg }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 -ml-2"
                      style={{ backgroundColor: p.bg }}
                    />
                    <span className="ml-1 text-[11px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors & Swap Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fg-color"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Foreground Color (Pattern)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-28 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="bg-color"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Background Color
                  </label>
                  <button
                    type="button"
                    onClick={swapColors}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    title="Swap foreground and background"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-28 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Contrast Warning Banner */}
            {isLowContrast && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    Low Contrast Detected ({contrastRatio.toFixed(1)}:1)
                  </p>
                  <p className="leading-relaxed">
                    Camera scanners may struggle to read this code. For reliable scanning, ensure high contrast (recommended ratio ≥ 4.5:1, such as dark foreground on light background).
                  </p>
                </div>
              </div>
            )}

            {/* Size & Error Correction Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Size Selector */}
              <div>
                <label
                  htmlFor="size-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Resolution (Size)
                </label>
                <select
                  id="size-select"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={200}>200 × 200 px (Thumbnail)</option>
                  <option value={300}>300 × 300 px (Standard)</option>
                  <option value={500}>500 × 500 px (High Res)</option>
                  <option value={1000}>1000 × 1000 px (Print Quality)</option>
                </select>
              </div>

              {/* Error Correction Level */}
              <div>
                <label
                  htmlFor="ec-level-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Error Correction Level
                </label>
                <select
                  id="ec-level-select"
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="L">L – Low (~7% recovery)</option>
                  <option value="M">M – Medium (~15% recovery, default)</option>
                  <option value="Q">Q – Quartile (~25% recovery)</option>
                  <option value="H">H – High (~30% recovery, best durability)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center flex flex-col items-center">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Live Preview</span>
            </div>

            {/* Canvas Box */}
            <div
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center max-w-[320px] w-full aspect-square"
              style={{ backgroundColor: bgColor }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {errorMsg && (
              <p className="mt-3 text-xs text-rose-500 font-medium">{errorMsg}</p>
            )}

            <p className="mt-3 text-[11px] text-slate-400">
              {size} × {size} px • Level {ecLevel}
            </p>

            {/* Action Buttons */}
            <div className="w-full mt-5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={downloading}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Download className="w-4 h-4" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={downloading}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <Download className="w-4 h-4" />
                  <span>SVG (Vector)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyImage}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Image Copied to Clipboard!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
