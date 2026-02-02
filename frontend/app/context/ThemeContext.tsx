"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<string>("evo");

    useEffect(() => {
        // Load local preference first to avoid flicker
        const localTheme = localStorage.getItem("kolozus_theme");
        if (localTheme) {
            setThemeState(localTheme);
        }

        // Fetch from backend (syncs if user logged in)
        // Ignoring errors for now (e.g. if offline or not logged in)
        api.getUIConfig()
            .then(config => {
                if (config && config.theme) {
                    setThemeState(config.theme);
                    localStorage.setItem("kolozus_theme", config.theme);
                }
            })
            .catch(() => {
                // Keep local or default
            });
    }, []);

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem("kolozus_theme", newTheme);

        // Persist to backend
        api.updateUIConfig(newTheme).catch(console.error);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
