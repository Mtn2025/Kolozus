"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Fragment } from "../lib/types";
import { useLanguage } from "../context/LanguageContext";

export default function TrashPage() {
    const { t } = useLanguage();
    const [trashedFragments, setTrashedFragments] = useState<Fragment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTrash = () => {
        setLoading(true);
        api.listTrash()
            .then(setTrashedFragments)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleRestore = async (id: string) => {
        if (confirm("Restore this item?")) {
            await api.restoreFromTrash(id);
            loadTrash();
        }
    };

    const handlePermanentDelete = async (id: string, text: string) => {
        if (confirm(`PERMANENTLY DELETE?\n\n"${text.substring(0, 50)}..."\n\nThis action cannot be undone.`)) {
            await api.permanentDelete(id);
            loadTrash();
        }
    };

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-red-900 sm:truncate sm:text-3xl sm:tracking-tight font-mono">
                        Trash Bin
                    </h2>
                    <p className="mt-1 text-sm text-red-500">
                        Items here are soft-deleted. Restore them or delete permanently.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg border border-red-200 overflow-hidden">
                <ul role="list" className="divide-y divide-slate-200">
                    {loading ? (
                        <li className="px-4 py-4 text-center text-slate-500">{t("Loading trash...")}</li>

                    ) : trashedFragments.length === 0 ? (
                        <li className="px-4 py-10 text-center text-slate-500">{t("Trash is empty.")}</li>

                    ) : (
                        trashedFragments.map((fragment) => (
                            <li key={fragment.id} className="px-4 py-4 sm:px-6 hover:bg-red-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1 pr-4">
                                        <p className="truncate text-sm font-medium text-slate-900 font-mono">
                                            {fragment.raw_text}
                                        </p>
                                        <p className="flex items-center text-xs text-slate-500 mt-1">
                                            <span className="truncate">{fragment.id}</span>
                                            <span className="mx-2">•</span>
                                            <span>{new Date(fragment.created_at).toLocaleString()}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRestore(fragment.id)}
                                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                        >
                                            Restore
                                        </button>
                                        <button
                                            onClick={() => handlePermanentDelete(fragment.id, fragment.raw_text)}
                                            className="inline-flex items-center rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
                                        >
                                            Delete Forever
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
