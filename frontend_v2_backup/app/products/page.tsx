"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSpace } from "../lib/SpaceContext";
import { useLanguage } from "../context/LanguageContext";
import { api, Product } from "../lib/api";

const fetcher = ([key, spaceId]: [string, string]) => api.getProducts(spaceId);

export default function ProductsPage() {
    const { t } = useLanguage();
    const { currentSpace } = useSpace();
    const [isCreating, setIsCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [archetype, setArchetype] = useState("non_fiction");
    const [style, setStyle] = useState("classic_publisher");

    const { data: products = [], mutate } = useSWR(
        currentSpace ? ["products", currentSpace.id] : null,
        fetcher
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !currentSpace) return;
        setIsCreating(true);
        try {
            await api.createProduct(newTitle, currentSpace.id, archetype, style);
            setNewTitle("");
            setIsModalOpen(false);
            mutate();
        } catch (err) {
            alert(t("Failed to create product"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProduct = async (id: string, title: string) => {
        if (confirm(`${t("Delete Product")} "${title}"?`)) {
            try {
                await api.deleteProduct(id);
                mutate(); // Refresh list
            } catch (e) {
                alert(t("Failed to delete product"));
            }
        }
    };


    if (!currentSpace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-full">
                    <span className="text-4xl">📚</span>
                </div>
                <h2 className="text-xl font-semibold">{t("Space Required")}</h2>
                <p className="text-muted-foreground">{t("Please select a Space to manage products.")}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">
                        {t("Publisher Studio")}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {t("Create expert-level content from your knowledge base.")}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                >
                    <span className="mr-2">✨</span>
                    {t("New Project")}
                </button>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
                        <span className="text-4xl mb-4">📝</span>
                        <p className="text-lg font-medium">{t("No editorial projects yet")}</p>
                        <p className="text-sm">{t("Create your first book, article, or paper.")}</p>
                    </div>
                )}

                {products.map((p) => (
                    <div key={p.id} className="group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden flex flex-col h-64">
                        {/* Status Bar */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <Link href={`/editor/${p.id}`} className="flex-1 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${p.archetype === 'non_fiction' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400' :
                                        p.archetype === 'paper' ? 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400' :
                                            'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {p.archetype.replace(/_/g, " ").toUpperCase()}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-3">
                                {p.title}
                            </h3>

                            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>{p.style_family.replace(/_/g, " ")}</span>
                                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                        </Link>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(p.id, p.title);
                            }}
                            className="absolute top-4 right-4 z-20 p-2 text-muted-foreground hover:text-destructive bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border"
                            title={t("Delete Product")}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-background rounded-xl border border-border shadow-lg max-w-2xl w-full mx-auto overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h3 className="text-lg font-bold">{t("Initialize New Project")}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">{t("Project Title")}</label>
                                <input
                                    type="text"
                                    placeholder={t("e.g., 'The Future of AI'")}
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="block w-full rounded-md border border-input bg-transparent py-2 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">{t("Archetype")}</label>
                                    <select
                                        value={archetype}
                                        onChange={e => setArchetype(e.target.value)}
                                        className="block w-full rounded-md border border-input bg-transparent py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <optgroup label={t("Editorial")}>
                                            <option value="non_fiction">{t("Non-Fiction Book")}</option>
                                            <option value="essay_anthology">{t("Essay Anthology")}</option>
                                            <option value="fiction">{t("Fiction / Novel")}</option>
                                        </optgroup>
                                        <optgroup label={t("Academic")}>
                                            <option value="thesis">{t("Thesis / Dissertation")}</option>
                                            <option value="scientific_paper">{t("Scientific Paper")}</option>
                                            <option value="textbook">{t("Textbook")}</option>
                                        </optgroup>
                                        <optgroup label={t("Business")}>
                                            <option value="white_paper">{t("White Paper")}</option>
                                            <option value="sop_manual">{t("SOP Manual")}</option>
                                            <option value="case_study">{t("Case Study Collection")}</option>
                                        </optgroup>
                                        <optgroup label={t("Digital")}>
                                            <option value="online_course">{t("Online Course")}</option>
                                            <option value="blog_series">{t("Blog Series")}</option>
                                            <option value="newsletter">{t("Newsletter Issue")}</option>
                                        </optgroup>
                                        <optgroup label={t("Technical")}>
                                            <option value="tech_docs">{t("Technical Documentation")}</option>
                                            <option value="product_roadmap">{t("Product Roadmap (PRD)")}</option>
                                        </optgroup>
                                        <optgroup label={t("Oral")}>
                                            <option value="keynote">{t("Keynote Speech")}</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">{t("Design Style")}</label>
                                    <select
                                        value={style}
                                        onChange={e => setStyle(e.target.value)}
                                        className="block w-full rounded-md border border-input bg-transparent py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="academic_rigor">{t("Academic Rigor (Serif, Justified)")}</option>
                                        <option value="modern_startup">{t("Modern Startup (Sans, Bold)")}</option>
                                        <option value="classic_publisher">{t("Classic Publisher (Garamond)")}</option>
                                        <option value="swiss_grid">{t("Swiss Grid (Clean, Blocky)")}</option>
                                        <option value="screen_flow">{t("Screen Flow (Digital First)")}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newTitle.trim()}
                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isCreating ? t("Creating Project...") : t("Initialize Project")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
