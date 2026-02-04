"use client";

import { useTheme } from "next-themes";
import { THEMES, ThemeDef } from "@/lib/themes";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

export default function ThemeSwitcher() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch & Sync with Backend
    useEffect(() => {
        setMounted(true);
        // Sync from Backend
        api.getUIConfig()
            .then(config => {
                if (config.theme) {
                    setTheme(config.theme);
                }
            })
            .catch(err => console.error("Failed to sync theme:", err));
    }, [setTheme]);

    const groupedThemes = THEMES.reduce((acc: Record<string, ThemeDef[]>, t: ThemeDef) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {} as Record<string, ThemeDef[]>);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        // Persist to backend silently
        api.updateUIConfig(newTheme).catch(console.error);
    };

    if (!mounted) return null;

    return (
        <div className="flex items-center ml-2">
            <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="
                    appearance-none
                    bg-transparent
                    px-2 py-1.5 
                    text-xs font-medium text-muted-foreground hover:text-foreground
                    border border-transparent hover:border-border rounded-md
                    focus:outline-none focus:ring-1 focus:ring-ring
                    cursor-pointer
                    capitalize
                "
                title="Design Theme"
            >
                {Object.entries(groupedThemes).map(([category, themes]) => (
                    <optgroup key={category} label={category}>
                        {themes.map(t => (
                            <option key={t.key} value={t.key}>{t.name}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
}
