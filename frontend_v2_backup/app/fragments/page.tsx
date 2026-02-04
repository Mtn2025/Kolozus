"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Fragment } from "../lib/types";
import Link from "next/link";
import { useSpace } from "../lib/SpaceContext";
import { useLanguage } from "../context/LanguageContext";

export default function FragmentExplorer() {
    const { t } = useLanguage();
    const [fragments, setFragments] = useState<Fragment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { currentSpace } = useSpace();

    const loadFragments = () => {
        setLoading(true);
        // If not loaded yet, wait or show empty? But spaces load fast.
        // Assuming currentSpace might be null momentarily
        const spaceId = currentSpace?.id;

        api.getFragments(spaceId)
            .then((data) => {
                setFragments(data);
                setSelectedIds(new Set());
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadFragments();
    }, [currentSpace]); // Reload when space changes

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === fragments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(fragments.map(f => f.id)));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Move to trash?")) {
            await api.moveToTrash(id);
            loadFragments();
        }
    };

    const handleBatchDelete = async () => {
        if (confirm(`Move ${selectedIds.size} items to trash?`)) {
            await api.batchMoveToTrash(Array.from(selectedIds));
            loadFragments();
        }
    };

    if (loading) return <div className="p-8 text-neutral-400">{t("Loading fragments...")}</div>;

    if (error) return <div className="p-8 text-red-500">{t("Error")}: {error}</div>;


    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Cognitive Fragments
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Raw immutable inputs processed by the cognitive engine.
                    </p>
                </div>
                <div className="flex gap-3">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transform transition-transform active:scale-95"
                        >
                            Trash Selected ({selectedIds.size})
                        </button>
                    )}
                    <Link href="/trash" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                        View Trash 🗑️
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                                <input
                                    type="checkbox"
                                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={fragments.length > 0 && selectedIds.size === fragments.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">ID / Hash</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">{t("Source")}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">{t("Content Preview")}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">{t("Timestamp")}</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">{t("Actions")}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {fragments.map(f => (
                            <tr key={f.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(f.id) ? 'bg-slate-50' : ''}`}>
                                <td className="relative px-7 sm:w-12 sm:px-6">
                                    <input
                                        type="checkbox"
                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        checked={selectedIds.has(f.id)}
                                        onChange={() => toggleSelection(f.id)}
                                    />
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-slate-500 sm:pl-6">{f.id.slice(0, 8)}...</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                        {f.source}
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-slate-900 max-w-xs truncate" title={f.raw_text}>
                                    {f.raw_text}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">
                                    {new Date(f.created_at).toLocaleString()}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end gap-2">
                                    <Link href={`/fragments/${f.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Inspect
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(f.id)}
                                        className="text-red-600 hover:text-red-900 ml-4"
                                    >
                                        Trash
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-right text-xs text-slate-400">
                Total Fragments: {fragments.length}
            </div>
        </div>
    );
}
