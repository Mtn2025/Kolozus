"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSpace } from "../lib/SpaceContext";
import { api, Product } from "../lib/api";

const fetcher = ([key, spaceId]: [string, string]) => api.getProducts(spaceId);

export default function ProductsPage() {
    const { currentSpace } = useSpace();
    const [isCreating, setIsCreating] = useState(false);
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
            mutate();
        } catch (err) {
            alert("Failed to create product");
        } finally {
            setIsCreating(false);
        }
    };

    if (!currentSpace) {
        return (
            <div className="text-center py-20 text-slate-500">
                Please select a Space to manage products.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight font-mono">
                        Editorial Engine
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Create expert-level content from your knowledge base.
                    </p>
                </div>
            </div>

            {/* CREATE CARD */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Project Title</label>
                        <input
                            type="text"
                            placeholder="e.g., 'The Future of AI'"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Archetype</label>
                            <select
                                value={archetype}
                                onChange={e => setArchetype(e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <optgroup label="Editorial">
                                    <option value="non_fiction">Non-Fiction Book</option>
                                    <option value="essay_anthology">Essay Anthology</option>
                                    <option value="fiction">Fiction / Novel</option>
                                </optgroup>
                                <optgroup label="Academic">
                                    <option value="thesis">Thesis / Dissertation</option>
                                    <option value="scientific_paper">Scientific Paper</option>
                                    <option value="textbook">Textbook</option>
                                </optgroup>
                                <optgroup label="Business">
                                    <option value="white_paper">White Paper</option>
                                    <option value="sop_manual">SOP Manual</option>
                                    <option value="case_study">Case Study Collection</option>
                                </optgroup>
                                <optgroup label="Digital">
                                    <option value="online_course">Online Course</option>
                                    <option value="blog_series">Blog Series</option>
                                    <option value="newsletter">Newsletter Issue</option>
                                </optgroup>
                                <optgroup label="Technical">
                                    <option value="tech_docs">Technical Documentation</option>
                                    <option value="product_roadmap">Product Roadmap (PRD)</option>
                                </optgroup>
                                <optgroup label="Oral">
                                    <option value="keynote">Keynote Speech</option>
                                </optgroup>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Design Style</label>
                            <select
                                value={style}
                                onChange={e => setStyle(e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value="academic_rigor">Academic Rigor (Serif, Justified)</option>
                                <option value="modern_startup">Modern Startup (Sans, Bold)</option>
                                <option value="classic_publisher">Classic Publisher (Garamond)</option>
                                <option value="swiss_grid">Swiss Grid (Clean, Blocky)</option>
                                <option value="screen_flow">Screen Flow (Digital First)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isCreating || !newTitle.trim()}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {isCreating ? "Creating Project..." : "Initialize Project"}
                        </button>
                    </div>
                </form>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                        No editorial projects yet in {currentSpace.name}.
                    </div>
                )}
                {products.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`} className="block group">
                        <div className="relative flex flex-col justify-between h-48 rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                        {p.archetype.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {p.style_family.replace(/_/g, " ")} (Draft)
                                    </span>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-900 group-hover:text-indigo-600">
                                    {p.title}
                                </h3>
                            </div>
                            <div className="text-xs text-slate-500">
                                Updated {new Date(p.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
