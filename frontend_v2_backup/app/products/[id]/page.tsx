"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { api, Product, ProductSection } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProductStudio() {
    const { t } = useLanguage();
    const params = useParams();
    // Safe access to params.id
    const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

    const { data: product, mutate, error } = useSWR<Product>(
        id ? `http://localhost:8000/products/${id}` : null,
        fetcher
    );


    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [interventionLevel, setInterventionLevel] = useState(0);

    if (error) return <div className="p-10 text-center text-red-500">{t("Error")}: {error}</div>;
    if (!product) return <div className="p-10 text-center">{t("Loading Studio...")}</div>;


    const activeSection = product.sections?.find(s => s.id === selectedSectionId);

    const handleAddSection = async () => {
        const title = prompt("Section Title:");
        if (title && id) {
            await api.addSection(id, title);
            mutate();
        }
    };

    const handleDraft = async () => {
        if (!selectedSectionId || !product) return;

        // Optimistic UI or Loading state
        // For simplicity:
        const btn = document.getElementById("draft-btn");
        if (btn) btn.innerHTML = "Thinking...";

        try {
            await api.draftSection(product.id, selectedSectionId, interventionLevel);
            mutate(); // Refresh data
        } catch (e) {
            alert("Drafting failed");
        }
    };

    const [showDesign, setShowDesign] = useState(false);
    const [overrides, setOverrides] = useState<any>({});

    // Load overrides when product loads
    if (product && !overrides.loaded && product.design_overrides) {
        setOverrides({ ...product.design_overrides, loaded: true });
    }

    const handleSaveDesign = async () => {
        if (!product) return;
        const { loaded, ...cleanOverrides } = overrides;
        await api.updateProduct(product.id, cleanOverrides);
        alert("Design Saved!");
        mutate();
    };

    const handleGenerateBlueprint = async () => {
        if (!product || !id) return;
        if (!confirm("Auto-generate structure? This uses AI to analyze your space content.")) return;

        try {
            // Optimistic feedback could go here
            await api.generateBlueprint(product.id);
            mutate();
        } catch (e) {
            alert("Blueprint generation failed: " + e);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
            {/* STUDIO HEADER */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">{product.title}</h1>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-100 text-yellow-800 border border-yellow-200">
                        {(product.status || "draft").toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDesign(!showDesign)}
                        className={`mr-2 px-3 py-1.5 rounded text-xs font-semibold border ${showDesign ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-300 text-slate-700'}`}
                    >
                        🎨 Design
                    </button>

                    <a
                        href={`http://localhost:8000/products/${product.id}/export?format=html`}
                        target="_blank"
                        rel="noreferrer"
                        className="mr-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1"
                    >
                        <span>👁️</span> Preview / Export
                    </a>

                    <span className="text-xs text-slate-400 mr-2">{t("Editorial Level:")}</span>


                    <div className="flex bg-white rounded-md border border-slate-200 p-1">
                        {[0, 1, 2, 3].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setInterventionLevel(lvl)}
                                className={`px-3 py-1 text-xs font-medium rounded ${interventionLevel === lvl
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                title={
                                    lvl === 0 ? "Raw Compilation" :
                                        lvl === 1 ? "Grammar Clean" :
                                            lvl === 2 ? "Narrative Flow" : "Deep Editorial"
                                }
                            >
                                L{lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* STUDIO BODY */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT: OUTLINE */}
                <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("Structure")}</span>


                        <button onClick={handleAddSection} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                            + Add Section
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {product.sections?.length === 0 && (
                            <div className="p-6 text-center border-b border-slate-100">
                                <p className="text-xs text-slate-400 mb-3">
                                    No sections yet.<br />Start manually or use AI.
                                </p>
                                <button
                                    onClick={handleGenerateBlueprint}
                                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                    <span>✨</span> Auto-Structure
                                </button>
                            </div>
                        )}
                        {product.sections?.sort((a, b) => a.order_index - b.order_index).map(sec => (
                            <div
                                key={sec.id}
                                onClick={() => setSelectedSectionId(sec.id)}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${selectedSectionId === sec.id
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="truncate flex-1">{sec.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MIDDLE: EDITOR */}
                <div className="flex-1 overflow-y-auto bg-white relative">
                    {activeSection ? (
                        <div className="max-w-3xl mx-auto py-12 px-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">{activeSection.title}</h2>
                            <div className="prose prose-slate lg:prose-lg">
                                {activeSection.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: activeSection.content }} />
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center">
                                        <p className="text-slate-500 mb-4">{t("This section is empty.")}</p>


                                        <button
                                            id="draft-btn"
                                            onClick={handleDraft}
                                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                        >
                                            Auto-Draft (Level {interventionLevel})
                                        </button>
                                        <p className="mt-2 text-xs text-slate-400">
                                            Will compile fragments from {product.space_id ? "Space" : "Global"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <p>{t("Select a section to begin writing, or generate a structure.")}</p>


                        </div>
                    )}
                </div>

                {/* RIGHT: DESIGN PANEL */}
                {showDesign && (
                    <div className="w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto shadow-xl z-10">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">{t("Design Specifications")}</h3>



                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">{t("Base Font")}</label>
                                <select
                                    className="w-full text-sm border-slate-300 rounded-md"
                                    value={overrides.font_base || ""}
                                    onChange={e => setOverrides({ ...overrides, font_base: e.target.value })}
                                >
                                    <option value="">{t("Default (System UI)")}</option>
                                    <option value="'Inter', sans-serif">{t("Inter (Modern)")}</option>
                                    <option value="'Georgia', serif">{t("Georgia (Classic)")}</option>
                                    <option value="'Courier New', monospace">{t("Courier (Draft)")}</option>
                                </select>

                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">{t("Primary Color")}</label>

                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        value={overrides.primary_color || "#1e293b"}
                                        onChange={e => setOverrides({ ...overrides, primary_color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 text-sm border-slate-300 rounded-md"
                                        value={overrides.primary_color || ""}
                                        onChange={e => setOverrides({ ...overrides, primary_color: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">{t("Accent Color")}</label>

                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        value={overrides.accent_color || "#3b82f6"}
                                        onChange={e => setOverrides({ ...overrides, accent_color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 text-sm border-slate-300 rounded-md"
                                        value={overrides.accent_color || ""}
                                        onChange={e => setOverrides({ ...overrides, accent_color: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <button
                                    onClick={handleSaveDesign}
                                    className="w-full bg-slate-900 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 text-sm"
                                >
                                    Save Design
                                </button>
                                <p className="mt-2 text-xs text-center text-slate-400">
                                    Refresh Preview to see changes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
