"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { GraphNode } from "../lib/types";
import Link from "next/link";

export default function LibraryPage() {
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        api.getKnowledgeGraph()
            .then(setNodes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredNodes = nodes.filter(n => filter === "all" || n.status === filter);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">Knowledge Library</h1>

                {/* Filters */}
                <div className="flex gap-2">
                    {["all", "germinal", "exploration", "consolidated"].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${filter === s
                                ? "bg-foreground text-background"
                                : "bg-card text-muted hover:text-foreground border border-border"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-muted">Loading library...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNodes.map(node => (
                        <Link key={node.id} href={`/idea/${node.id}`} className="block group">
                            <div className="bg-card border border-border p-5 rounded-lg h-full hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${node.status === 'germinal' ? 'bg-muted/20 text-muted' :
                                                node.status === 'exploration' ? 'bg-primary/10 text-primary' :
                                                    'bg-green-500/10 text-green-600'
                                            }`}>
                                            {node.status}
                                        </span>
                                    </div>
                                    <h3 className="text-foreground font-medium group-hover:text-primary leading-snug mb-2">
                                        {node.label || "Untitled Idea"}
                                    </h3>
                                </div>
                                <div className="text-xs text-muted font-mono mt-4 pt-4 border-t border-border flex justify-between">
                                    <span>ID: {node.id.slice(0, 6)}...</span>
                                    <span>Weight: {node.weight}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
