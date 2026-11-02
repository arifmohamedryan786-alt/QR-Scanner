import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors mt-auto py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Bottom Credits & Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} QR Studio. Built with Next.js, Tailwind CSS & TypeScript.</p>
          <span>Built by Arif Mohamed</span>
        </div>
      </div>
    </footer>
  );
};
