"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";
import { Fragment, DecisionLog } from "../../lib/types";
import Link from "next/link";

export default function FragmentDetail() {
    const { id } = useParams() as { id: string };
    const [fragment, setFragment] = useState<Fragment | null>(null);
    const [audit, setAudit] = useState<DecisionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            api.getFragment(id),
            api.getFragmentAudit(id).catch(() => []) // Audit might be empty on fresh ingest? No, usually not. But permissive.
        ])
            .then(([f, a]) => {
                setFragment(f);
                setAudit(a);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8">Loading detail...</div>;
    if (error || !fragment) return <div className="p-8 text-red-500">Error: {error || "Not found"}</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <Link href="/fragments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-4 block">&larr; Back to Explorer</Link>

            {/* HEADER */}
            <div className="bg-white shadow sm:rounded-lg border border-slate-200 p-6">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight font-mono">
                            FRAGMENT: {fragment.id}
                        </h2>
                        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-slate-500 font-mono">
                                {new Date(fragment.created_at).toISOString()}
                            </div>
                            <div className="mt-2 flex items-center">
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 uppercase tracking-wide">
                                    Source: {fragment.source}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RAW PAYLOAD */}
            <section className="bg-white shadow sm:rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">Payload (Invariant)</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">Original text content injected into the system.</p>
                </div>
                <div className="bg-slate-50 px-4 py-5 sm:p-6 font-mono text-sm text-slate-700 whitespace-pre-wrap border-t border-slate-100">
                    {fragment.raw_text}
                </div>
            </section>

            {/* DECISION TRACE */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Cognitive Audit Trace</h3>
                    {/* Placeholder for Replay Button */}
                </div>

                {audit.length === 0 ? (
                    <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">No decisions recorded</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>This fragment may have been ingested before the audit ledger was active.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {audit.map((log) => (
                            <div key={log.id} className="overflow-hidden rounded-lg bg-white shadow border border-slate-200">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <div className="font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                                    <div className="flex gap-3 items-center">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${log.action === "CREATE_NEW" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                            log.action === "ATTACH" ? "bg-purple-50 text-purple-700 ring-purple-700/10" :
                                                "bg-gray-50 text-gray-600 ring-gray-500/10"
                                            }`}>
                                            {log.action}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600">Conf: {(log.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reasoning</h4>
                                        <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-3">
                                            "{log.reasoning}"
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Entity</h4>
                                        <Link href={`/idea/${log.target_idea_id}`} className="text-sm font-mono text-indigo-600 hover:text-indigo-900 hover:underline">
                                            {log.target_idea_id || "N/A"}
                                        </Link>
                                    </div>
                                </div>
                                {log.meta && (
                                    <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-200">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Execution Metadata</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(log.meta).map(([k, v]) => (
                                                <span key={k} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                    {k}: {String(v).slice(0, 20)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
