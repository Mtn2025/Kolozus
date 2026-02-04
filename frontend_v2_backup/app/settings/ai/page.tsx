"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIProfileCard } from "@/components/AIProfileCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Save } from "lucide-react";

interface AIProfile {
    name: string;
    // other config fields omitted for simplicity in this view
}

const PROFILES = [
    {
        key: 'maestro',
        title: 'Editorial Maestro',
        description: 'Maximum quality and structure. Uses Groq Llama 3.3 70B. Ideal for professional publishing.'
    },
    {
        key: 'spark',
        title: 'Spark Writer',
        description: 'Rocket speed for brainstorming. Uses Groq Llama 3.1 8B. Instant generation.'
    },
    {
        key: 'guardian',
        title: 'Private Guardian',
        description: '100% Local privacy. Uses Ollama (DeepSeek R1 + Llama 3.3). Requires powerful GPU.'
    },
    {
        key: 'custom',
        title: 'Custom Forge',
        description: 'Advanced configuration. Manually select providers for each agent role.'
    }
];

import { useLanguage } from "@/app/context/LanguageContext";

export default function AISettingsPage() {
    const { t } = useLanguage();
    const [currentProfile, setCurrentProfile] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/ai/config');
            if (!res.ok) throw new Error("Failed to fetch config");
            const data: AIProfile = await res.json();
            setCurrentProfile(data.name);
        } catch (err: any) {
            setError(err.message || "Could not load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (profileName: string) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const res = await fetch('http://localhost:8000/api/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_name: profileName })
            });
            if (!res.ok) throw new Error("Failed to update profile");

            const data = await res.json();
            setCurrentProfile(data.profile);
            setSuccessMessage(`Active profile switched to ${profileName.toUpperCase()}`);
        } catch (err: any) {
            setError(err.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t("AI Infrastructure")}</h1>
                <p className="text-muted-foreground mt-2">
                    {t("Select the cognitive engine that powers Kolozus. Choose between Cloud Speed, Quality, or Local Privacy.")}
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert className="mb-6 border-green-500 bg-green-500/10 text-green-700">
                    <Save className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {PROFILES.map((profile) => (
                    <AIProfileCard
                        key={profile.key}
                        profileKey={profile.key}
                        title={t(profile.title)}
                        description={t(profile.description)}
                        isActive={currentProfile === profile.key}
                        onSelect={() => handleSave(profile.key)}
                    />
                ))}
            </div>

            <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">{t("Technical Status")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t("Groq Connection")}</span>
                        <span className="text-green-600 font-medium">● {t("Connected")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t("Ollama Local")}</span>
                        <span className="text-yellow-600 font-medium">● {t("Checking...")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
