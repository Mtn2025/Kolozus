"use client";

import { useLanguage } from "@/app/context/LanguageContext";

export default function SearchButton() {
    const { t } = useLanguage();
    return (
        <button
            onClick={() => document.dispatchEvent(new CustomEvent('kolozus:open-search'))}
            className="hidden sm:flex items-center text-sm text-slate-500 hover:text-slate-700 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
        >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {t("Search...")}
            <span className="ml-2 text-xs text-slate-400 font-mono border border-slate-300 rounded px-1">⌘K</span>
        </button>
    );
}
