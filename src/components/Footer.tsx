import React from "react";
import { ShieldCheck, Lock, Smartphone } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors mt-auto py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Security & Privacy Notice Card */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-slate-700 dark:text-slate-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                100% Private & Device-Local Processing
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                All QR scanning and generation happen exclusively in your browser using WebAssembly and client-side JavaScript. No images, camera feeds, or generated payloads are ever transmitted to any remote server or third party.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/40 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Camera access requires HTTPS (automatically provided when deployed on Vercel)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              Works on iOS Safari, Android Chrome, and modern desktop browsers
            </span>
          </div>
        </div>

        {/* Bottom Credits & Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} QR Studio. Built with Next.js, Tailwind CSS & TypeScript.</p>
          <span>Built by Arif Mohamed</span>
        </div>
      </div>
    </footer>
  );
};

