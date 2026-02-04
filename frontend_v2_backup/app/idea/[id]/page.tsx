"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";
import { Fragment } from "../../lib/types";
import { useLanguage } from "../../context/LanguageContext";

interface IdeaDetail {
    id: string;
    title_provisional: string;
    status: string;
    semantic_profile?: {
        fragment_count: number;
        centroid: number[];
    } | null;
}

interface IdeaVersion {
    version_number: number;
    stage: string;
    synthesized_text: string;
    reasoning_log: string | null;
    created_at: string;
}

export default function IdeaDetailPage() {
    const { t } = useLanguage();
    const { id } = useParams() as { id: string };
    const [idea, setIdea] = useState<IdeaDetail | null>(null);
    const [history, setHistory] = useState<IdeaVersion[]>([]);
    const [fragments, setFragments] = useState<Fragment[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"history" | "provenance">("history");

    useEffect(() => {
        if (!id) return;

        Promise.all([
            api.getIdea(id),
            api.getIdeaHistory(id),
            api.getIdeaFragments(id)
        ])
            .then(([ideaData, historyData, fragmentData]) => {
                setIdea(ideaData);
                setHistory(historyData);
                setFragments(fragmentData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 text-muted">{t("Syncing with cortex...")}</div>;
    if (!idea) return <div className="p-8 text-muted">{t("Idea not found in memory.")}</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans">
            <Link href="/library" className="text-muted hover:text-foreground mb-6 block text-sm">&larr; Back to Library</Link>

            {/* HEADER */}
            <div className="mb-8 border-b border-border pb-6 px-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block ${idea.status === 'germinal' ? 'bg-muted/20 text-muted' :
                            idea.status === 'exploration' ? 'bg-primary/10 text-primary' :
                                'bg-green-500/10 text-green-600'
                            }`}>
                            {idea.status}
                        </span>
                        <h1 className="text-3xl font-bold text-foreground mb-2 leading-tight">{idea.title_provisional || "Untitled Idea"}</h1>
                    </div>
                </div>
                <p className="text-muted text-xs font-mono mb-4">UUID: {idea.id}</p>

                {idea.semantic_profile && (
                    <div className="flex gap-8 text-xs text-muted uppercase tracking-wide font-medium">
                        <div>INPUTS: <span className="text-foreground ml-2">{idea.semantic_profile.fragment_count}</span></div>
                        <div>CENTROID: <span className="text-foreground ml-2 font-mono">[{idea.semantic_profile.centroid.slice(0, 3).map(n => n.toFixed(3)).join(',')}]</span></div>
                    </div>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-6 border-b border-border mb-6 px-4">
                <button
                    onClick={() => setTab("history")}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${tab === "history" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-foreground"
                        }`}
                >
                    Evolution History
                </button>
                <button
                    onClick={() => setTab("provenance")}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${tab === "provenance" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-foreground"
                        }`}
                >
                    Provenance (Fragments)
                </button>
            </div>

            {/* CONTENT */}
            <div className="px-4">
                {tab === "history" && (
                    <div className="space-y-6">
                        {history.map((version) => (
                            <div key={version.version_number} className="relative pl-8 border-l border-primary/20">
                                <div className="absolute -left-1.5 top-0 w-3 h-3 bg-primary rounded-full ring-4 ring-background"></div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono font-bold text-primary">v{version.version_number}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-muted border border-border px-1.5 rounded">{version.stage}</span>
                                    <span className="text-xs text-muted ml-auto">{new Date(version.created_at).toLocaleString()}</span>
                                </div>
                                <div className="bg-card p-4 rounded-lg border border-border text-foreground leading-relaxed mb-3 shadow-sm">
                                    {version.synthesized_text}
                                </div>
                                {version.reasoning_log && (
                                    <div className="text-xs text-muted bg-muted/10 p-3 rounded border border-border/50 italic">
                                        Reasoning: "{version.reasoning_log}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {tab === "provenance" && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted mb-4">{t("Raw inputs that have been attached to this idea by the Cognitive Engine.")}</p>
                        {fragments.length === 0 ? (
                            <div className="text-muted italic">{t("No direct fragments linked (Genesis might differ).")}</div>
                        ) : (
                            fragments.map(f => (
                                <div key={f.id} className="bg-card border border-border p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs bg-muted/20 text-muted px-2 py-1 rounded">{f.source}</span>
                                        <Link href={`/fragments/${f.id}`} className="text-primary hover:text-primary/80 text-xs hover:underline">
                                            Inspect Trace &rarr;
                                        </Link>
                                    </div>
                                    <p className="text-foreground text-sm font-mono whitespace-pre-wrap">{f.raw_text}</p>
                                    <div className="mt-2 text-[10px] text-muted font-mono">ID: {f.id}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
