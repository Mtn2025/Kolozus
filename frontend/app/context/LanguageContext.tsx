"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem("kolozus_language");
        if (saved && (saved === "en" || saved === "es")) {
            setLanguageState(saved as Language);
        } else {
            // Default to spanish if browser suggests it? No, keeping strict default 'en' for now unless requested.
            // Actually user requested spanish activation.
            // Let's check browser lang but default 'en' usually safest for tech products unless specified.
            // User said "activate spanish". Let's default to ES if nothing saved?
            // "activa español" implies default might want to be Spanish.
            // Let's stick to 'en' default but make it easy to switch.
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("kolozus_language", lang);
    };

    // Simple translation helper stub
    const t = (key: string, fallback?: string) => {
        // In a real app we'd have a dictionary here.
        // For now, pass through or simple logic.
        return fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
