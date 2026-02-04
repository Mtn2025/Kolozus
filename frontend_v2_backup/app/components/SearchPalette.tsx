"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { SearchResult } from "../lib/types";
import { useLanguage } from "../context/LanguageContext";
import { useSpace } from "../lib/SpaceContext";

export default function SearchPalette() {
    const { t } = useLanguage();
    const { currentSpace } = useSpace();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle with Cmd+K or Custom Event
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        const openEvent = () => setOpen(true);

        document.addEventListener("keydown", down);
        document.addEventListener("kolozus:open-search", openEvent);

        return () => {
            document.removeEventListener("keydown", down);
            document.removeEventListener("kolozus:open-search", openEvent);
        };
    }, []);

    // Focus input on open
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setResults([]);
        }
    }, [open]);

    // Search logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length > 2) {
                setLoading(true);
                // Fix: Pass currentSpace.id to scope search
                api.searchKnowledge(query, currentSpace?.id)
                    .then(setResults)
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setResults([]);
            }
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query, currentSpace?.id]);

    // Navigation logic
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (results.length ? (prev + 1) % results.length : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (results.length ? (prev - 1 + results.length) % results.length : 0));
        } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            const result = results[activeIndex];
            router.push(`/idea/${result.id}`);
            setOpen(false);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-border px-4 py-3">
                    <svg className="w-5 h-5 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground h-8 text-lg"
                        placeholder={t("Search knowledge...")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="text-xs font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {t("Thinking...")}
                        </div>
                    )}

                    {!loading && query.length > 2 && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {t("No matching ideas found.")}
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <ul className="py-2">
                            {results.map((result, index) => (
                                <li
                                    key={result.id}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${index === activeIndex ? 'bg-secondary' : 'hover:bg-secondary/50'
                                        }`}
                                    onClick={() => {
                                        router.push(`/idea/${result.id}`);
                                        setOpen(false);
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div>
                                        <div className="font-medium text-foreground">{result.title}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{result.status} • {result.domain}</div>
                                    </div>
                                    {index === activeIndex && (
                                        <div className="text-primary">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {!loading && query.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                            {t("Search for specific concepts, ideas or domains.")}
                        </div>
                    )}
                </div>

                <div className="bg-secondary/30 px-4 py-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                    <span><strong>{t("ProTip:")}</strong> {t("Use regular natural language.")}</span>
                    <span>{t("Kolozus Semantic Search")}</span>
                </div>
            </div>
        </div>
    );
}
