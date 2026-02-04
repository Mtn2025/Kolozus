"use client";

import { useEffect, useState, use } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { api, Product, ProductSection } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableSectionItem({ section, isActive, onClick }: { section: ProductSection, isActive: boolean, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={onClick}
            className={`group flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                }`}
        >
            <span
                {...listeners}
                className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing px-1"
                title="Drag to reorder"
            >
                ⋮⋮
            </span>
            <span className="truncate flex-1">
                {section.title || "Untitled Section"}
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 rounded">
                L{section.intervention_level}
            </span>
        </div>
    );
}

const fetcher = (url: string) => api.getProduct(url.split('/').pop()!);

export default function EditorPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const { t } = useLanguage();
    const { data: product, error } = useSWR<Product>(`product-${params.id}`, () => api.getProduct(params.id));

    // Local state for optimistic updates
    const [sections, setSections] = useState<ProductSection[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (product?.sections) {
            // Sort by order_index
            const sorted = [...product.sections].sort((a, b) => a.order_index - b.order_index);
            setSections(sorted);
            if (!activeSectionId && sorted.length > 0) {
                setActiveSectionId(sorted[0].id);
            }
        }
    }, [product]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // TODO: Persist order to backend
                // api.updateSectionOrder(product!.id, newItems.map(i => i.id));

                return newItems;
            });
        }
    };

    const handleAddSection = async () => {
        if (!product) return;
        const title = prompt(t("Section Title"));
        if (!title) return;

        try {
            const newSection = await api.addSection(product.id, title);
            setSections([...sections, newSection]);
            mutate(`product-${product.id}`); // Refresh
        } catch (e) {
            alert(t("Failed to add section"));
        }
    };

    const activeSection = sections.find(s => s.id === activeSectionId);

    if (error) return <div className="p-8 text-red-500">Error loading product</div>;
    if (!product) return <div className="p-8 text-muted">{t("Loading editor...")}</div>;

    return (
        <div className="flex bg-background h-[calc(100vh-4rem)] overflow-hidden">
            {/* Left Sidebar */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-[width] duration-300 border-r border-border bg-card flex flex-col shrink-0`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="overflow-hidden">
                        <Link href="/products" className="text-xs text-muted-foreground hover:text-primary mb-1 block">
                            ← {t("Back")}
                        </Link>
                        <h2 className="font-bold truncate" title={product.title}>{product.title}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                    <div className="flex items-center justify-between px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{t("Table of Contents")}</span>
                        <button onClick={handleAddSection} className="hover:text-primary text-lg leading-none" title={t("Add Section")}>+</button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {sections.map((section) => (
                                <SortableSectionItem
                                    key={section.id}
                                    section={section}
                                    isActive={activeSectionId === section.id}
                                    onClick={() => setActiveSectionId(section.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {sections.length === 0 && (
                        <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed border-border rounded-md m-2">
                            {t("No sections yet.")} <br />
                            <button onClick={handleAddSection} className="text-primary underline mt-1">{t("Add the first one")}</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Sidebar Button */}
            <div className="border-r border-border bg-card flex flex-col items-center py-4 text-muted-foreground hover:text-foreground cursor-pointer w-4 hover:bg-secondary/50 transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <span className="text-xs rotate-90 whitespace-nowrap mt-10">
                    {isSidebarOpen ? '◄' : '►'}
                </span>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                {/* Editor Header */}
                <div className="h-14 border-b border-border flex items-center px-6 justify-between bg-card/30 backdrop-blur">
                    {activeSection ? (
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-xl font-display font-semibold text-foreground">
                                {activeSection.title}
                            </h1>
                            <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
                                Draft
                            </span>
                        </div>
                    ) : (
                        <div className="text-muted-foreground">{t("Select a section to edit")}</div>
                    )}

                    <div className="flex items-center gap-2">
                        <button className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-medium">
                            {t("Generate AI Draft")}
                        </button>
                        <button className="text-xs bg-secondary hover:bg-muted text-foreground px-3 py-1.5 rounded-md transition-colors border border-border">
                            {t("Save")}
                        </button>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                    {activeSection ? (
                        <textarea
                            className="w-full h-full min-h-[500px] resize-none bg-transparent border-0 focus:ring-0 text-lg leading-relaxed text-foreground placeholder:text-muted/30 font-serif"
                            placeholder={t("Start writing or generate a draft using your knowledge base...")}
                            defaultValue={activeSection.content || ""}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <span className="text-4xl mb-4">👈</span>
                            <p>{t("Select a section from the sidebar to start editing.")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
