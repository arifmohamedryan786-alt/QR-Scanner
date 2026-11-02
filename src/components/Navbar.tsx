"use client";

import React, { useEffect, useState } from "react";
import { QrCode, ScanLine, Sparkles, Sun, Moon, Laptop } from "lucide-react";
import { getStoredTheme, setStoredTheme, Theme } from "@/utils/storage";

interface NavbarProps {
  activeTab: "scan" | "generate";
  onTabChange: (tab: "scan" | "generate") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getStoredTheme();
    setTheme(saved);
    applyTheme(saved);

    // Listen to OS theme changes if on system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      // System
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const cycleTheme = () => {
    const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 justify-start min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              QR Studio
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Free Scanner &amp; Generator
            </p>
          </div>
        </div>

        {/* Tab Controls (Centered Pill Switcher) */}
        <div className="flex items-center justify-center">
          <nav
            aria-label="Application tabs"
            className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          >
            <button
              onClick={() => onTabChange("scan")}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeTab === "scan"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-selected={activeTab === "scan"}
              role="tab"
            >
              <ScanLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Scan</span>
            </button>
            <button
              onClick={() => onTabChange("generate")}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeTab === "generate"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-selected={activeTab === "generate"}
              role="tab"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Generate</span>
            </button>
          </nav>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-end gap-2">
          {mounted && (
            <button
              onClick={cycleTheme}
              title={`Current theme: ${theme}. Click to change.`}
              aria-label={`Toggle theme (currently ${theme})`}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : theme === "light" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Laptop className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

