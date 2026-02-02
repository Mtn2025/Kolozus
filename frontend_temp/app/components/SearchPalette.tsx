"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { SearchResult } from "../lib/types";

export default function SearchPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
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
                api.searchKnowledge(query)
                    .then(setResults)
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setResults([]);
            }
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Navigation logic
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + results.length) % results.length);
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
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-slate-200 px-4 py-3">
                    <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 h-8 text-lg"
                        placeholder="Search knowledge..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="text-xs font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            Thinking...
                        </div>
                    )}

                    {!loading && query.length > 2 && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            No matching ideas found.
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <ul className="py-2">
                            {results.map((result, index) => (
                                <li
                                    key={result.id}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${index === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
                                        }`}
                                    onClick={() => {
                                        router.push(`/idea/${result.id}`);
                                        setOpen(false);
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div>
                                        <div className="font-medium text-slate-900">{result.title}</div>
                                        <div className="text-xs text-slate-500 capitalize">{result.status} • {result.domain}</div>
                                    </div>
                                    {index === activeIndex && (
                                        <div className="text-slate-400">
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
                        <div className="px-4 py-8 text-center text-xs text-slate-400">
                            Search for specific concepts, ideas or domains.
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <span><strong>ProTip:</strong> Use regular natural language.</span>
                    <span>Kolozus Semantic Search</span>
                </div>
            </div>
        </div>
    );
}
