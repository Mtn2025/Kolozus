"use client";

import { useState } from "react";
import { api } from "../lib/api";
import Link from "next/link";
import { useSpace } from "@/app/lib/SpaceContext";

export default function MassIngestion() {
    const [textInput, setTextInput] = useState("");
    const [mode, setMode] = useState("default");
    const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
    const [results, setResults] = useState<any[]>([]);
    const { currentSpace } = useSpace();

    const handleIngest = async () => {
        if (!textInput.trim()) return;
        if (!currentSpace) {
            alert("Please select a Space first (top left corner).");
            return;
        }

        setStatus("processing");

        // Split by double newline to simulate separate fragments from a big dump
        const fragments = textInput.split(/\n\s*\n/).filter(t => t.trim().length > 0);

        try {
            // Include space_id in payload
            const batchPayload = fragments.map(text => ({
                text: text.trim(),
                source: "batch_upload",
                mode,
                space_id: currentSpace.id
            }));
            const res = await api.ingestBatch(batchPayload, currentSpace.id, mode);
            setResults(res);
            setStatus("done");
        } catch (e) {
            console.error(e);
            alert("Batch ingestion failed");
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight font-mono">
                        Mass Ingestion
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Paste bulk text or logs. Double newlines act as delimiters.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                        Target Space: {currentSpace?.name || "None"}
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0 items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Cognitive Mode:</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="default">Balanced (Default)</option>
                        <option value="explorer">Explorer (Create New)</option>
                        <option value="consolidator">Consolidator (Link Existing)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg border border-slate-200 p-6">
                <textarea
                    rows={10}
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                    placeholder="Paste your raw notes, logs, or brainstorming dump here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={status === "processing"}
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleIngest}
                        disabled={status === "processing" || !textInput.trim()}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {status === "processing" ? "Processing Batch..." : "Ingest Batch"}
                    </button>
                </div>
            </div>

            {status === "done" && (
                <div className="bg-white shadow sm:rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-base font-semibold leading-6 text-slate-900">Batch Results</h3>
                    </div>
                    <ul role="list" className="divide-y divide-slate-200">
                        {results.map((res, idx) => (
                            <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <p className="truncate text-sm font-medium text-indigo-600 font-mono">
                                        {res.text_preview}...
                                    </p>
                                    <div className="ml-2 flex flex-shrink-0">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${res.decision === 'CREATE_NEW' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            res.decision === 'ATTACH' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                                                'bg-gray-50 text-gray-600 ring-gray-600/20'
                                            }`}>
                                            {res.decision} {res.target_idea ? `-> ${res.target_idea}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
