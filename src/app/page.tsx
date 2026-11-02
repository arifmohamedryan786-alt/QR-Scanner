"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScannerTab } from "@/components/scanner/ScannerTab";
import { QrGenerator } from "@/components/generator/QrGenerator";
import { getStoredTab, setStoredTab } from "@/utils/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"scan" | "generate">("scan");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lastTab = getStoredTab();
    setActiveTab(lastTab);
  }, []);

  const handleTabChange = (tab: "scan" | "generate") => {
    setActiveTab(tab);
    setStoredTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Intro banner */}
        <div className="text-center mb-8 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {activeTab === "scan" ? "Scan Any QR Code" : "Create Custom QR Codes"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {activeTab === "scan"
              ? "Instantly decode QR codes with your device camera or uploaded image. 100% private and on-device."
              : "Generate high-resolution PNG & SVG vector QR codes for websites, Wi-Fi networks, emails, and phone numbers."}
          </p>
        </div>

        {/* Tab Content */}
        {mounted && (
          <div role="tabpanel" id={`${activeTab}-panel`}>
            {activeTab === "scan" ? (
              <ScannerTab active={activeTab === "scan"} />
            ) : (
              <QrGenerator />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
