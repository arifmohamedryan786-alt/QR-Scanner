import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors mt-auto py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        <span>Built by Arif Mohamed</span>
      </div>
    </footer>
  );
};
