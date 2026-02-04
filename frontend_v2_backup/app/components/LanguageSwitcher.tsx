"use client";

import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center ml-4">
            <button
                onClick={() => setLanguage(language === "en" ? "es" : "en")}
                className="
                    flex items-center justify-center 
                    px-3 py-1.5 
                    text-xs font-bold font-mono tracking-wider
                    border border-slate-200 rounded-md 
                    text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50
                    transition-all
                "
                title="Switch Language / Cambiar Idioma"
            >
                {language.toUpperCase()}
            </button>
        </div>
    );
}
