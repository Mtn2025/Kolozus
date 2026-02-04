"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import { ThemeCard } from "@/components/ThemeCard";
import { THEMES, ThemeDef, ThemeKey } from "@/lib/themes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Palette, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UIConfig {
    theme: string;
}

import { useLanguage } from "@/app/context/LanguageContext";

export default function AppearancePage() {
    const { t } = useLanguage();
    const { setTheme, theme: currentTheme } = useTheme(); // next-themes hook
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hydration check
    useEffect(() => {
        setMounted(true);
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/ui/config');
            if (res.ok) {
                const data: UIConfig = await res.json();
                // Sync backend config to local theme if different
                // BUT we prioritize user interaction. This is initial load.
                // If local storage has a value, next-themes uses it.
                // We should enforce backend value on login/load.
                if (data.theme) {
                    setTheme(data.theme);
                }
            }
        } catch (err) {
            console.error("Failed to load theme config", err);
        } finally {
            setLoading(false);
        }
    };

    const handleThemeSelect = async (key: string) => {
        // 1. Immediate UI Feedback (Optimistic)
        setTheme(key);
        setSaving(true);
        setError(null);

        // 2. Persist to Backend
        try {
            const res = await fetch('http://localhost:8000/api/ui/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: key })
            });
            if (!res.ok) throw new Error("Failed to save preference");
        } catch (err: any) {
            setError("Could not save theme preference. It will reset on reload.");
            // Optional: Revert? Probably annoying. Let's keep it local.
        } finally {
            setSaving(false);
        }
    };

    // Group themes by category
    const groupedThemes = THEMES.reduce((acc, theme) => {
        if (!acc[theme.category]) acc[theme.category] = [];
        acc[theme.category].push(theme);
        return acc;
    }, {} as Record<string, ThemeDef[]>);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("Appearance")}</h1>
                <p className="text-muted-foreground mt-2">
                    {t("Customize the look and feel of your workspace. Changes are saved to your profile.")}
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {Object.entries(groupedThemes).map(([category, themes]) => (
                <div key={category} className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {category}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {themes.map((theme) => (
                            <div key={theme.key} className="h-full">
                                <ThemeCard
                                    theme={{ ...theme, name: t(theme.name), description: t(theme.description) }}
                                    isActive={currentTheme === theme.key}
                                    onSelect={handleThemeSelect}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4">
                <span className="text-sm text-muted-foreground">
                    {saving ? t("Saving...") : t("All changes saved locally and to cloud.")}
                </span>
            </div>
        </div>
    );
}
