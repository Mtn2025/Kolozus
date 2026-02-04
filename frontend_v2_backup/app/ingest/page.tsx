"use client";

import { useState } from "react";
import { api } from "../lib/api";
import Link from "next/link";
import { useSpace } from "@/app/lib/SpaceContext";
import { useLanguage } from "../context/LanguageContext";

export default function MassIngestion() {
    const { t } = useLanguage();
    const [textInput, setTextInput] = useState("");
    const [mode, setMode] = useState("default");
    const [source, setSource] = useState("manual");
    const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
    const [results, setResults] = useState<any[]>([]);
    const { currentSpace } = useSpace();

    const handleIngest = async () => {
        if (!textInput.trim()) return;
        if (!currentSpace) {
            alert(t("Please select a Space first (top left corner)."));
            return;
        }

        setStatus("processing");

        // Split by double newline to simulate separate fragments from a big dump
        const fragments = textInput.split(/\n\s*\n/).filter(t => t.trim().length > 0);

        try {
            // Include space_id and source in payload
            const batchPayload = fragments.map(text => ({
                text: text.trim(),
                source: source,
                mode,
                space_id: currentSpace.id
            }));
            const res = await api.ingestBatch(batchPayload, currentSpace.id, mode);
            setResults(res);
            setStatus("done");
        } catch (e) {
            console.error(e);
            alert(t("Batch ingestion failed"));
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary font-display">
                        {t("Ingestion Engine")}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {t("Paste bulk text or logs. Double newlines act as delimiters.")}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-2">
                        {t("Target Space")}:
                    </span>
                    <span className="px-3 py-1 bg-background border border-border rounded-md text-sm font-medium shadow-sm">
                        {currentSpace?.name || t("No Space Selected")}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("Cognitive Mode")}</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="default">{t("Balanced (Default)")}</option>
                        <option value="explorer">{t("Explorer (Create New)")}</option>
                        <option value="consolidator">{t("Consolidator (Link Existing)")}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("Source Type")}</label>
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="manual">{t("Manual Entry")}</option>
                        <option value="web_clip">{t("Web Clip")}</option>
                        <option value="book_excerpt">{t("Book Excerpt")}</option>
                        <option value="meeting_notes">{t("Meeting Notes")}</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={handleIngest}
                        disabled={status === "processing" || !textInput.trim()}
                        className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 h-10"
                    >
                        {status === "processing" ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t("Processing Batch...")}
                            </>
                        ) : (
                            <>
                                <span className="mr-2">⚡</span>
                                {t("Ingest Batch")}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="relative rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-primary">
                <textarea
                    rows={12}
                    className="block w-full resize-none border-0 bg-transparent py-4 px-4 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm sm:leading-6 font-mono"
                    placeholder={t("Paste your raw notes, logs, or brainstorming dump here...")}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={status === "processing"}
                />

                {/* Character Count */}
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                    {textInput.length} chars
                </div>
            </div>

            {/* Results */}
            {status === "done" && (
                <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col space-y-1.5 p-6 border-b border-border bg-secondary/10">
                        <h3 className="font-semibold leading-none tracking-tight">{t("Batch Results")}</h3>
                        <p className="text-sm text-muted-foreground">{t("Successfully processed fragments with current configuration.")}</p>
                    </div>
                    <div className="p-0">
                        <div className="divide-y divide-border">
                            {results.map((res, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-mono text-foreground/80 truncate">
                                            {res.text_preview}...
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border ${res.decision === 'CREATE_NEW'
                                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                : res.decision === 'ATTACH'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                    : 'bg-secondary text-secondary-foreground border-border'
                                            }`}>
                                            {t(res.decision)} {res.target_idea ? `→ ${res.target_idea}` : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
