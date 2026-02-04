"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, FileText, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductSection } from "@/types"
import { cn } from "@/lib/utils"

interface BlueprintViewerProps {
    sections: ProductSection[]
    onSelectSection: (section: ProductSection) => void
    onGenerateDraft: (sectionId: string) => Promise<void>
    selectedSectionId?: string
}

export function BlueprintViewer({ sections, onSelectSection, onGenerateDraft, selectedSectionId }: BlueprintViewerProps) {
    if (!sections || sections.length === 0) {
        return <div className="p-4 text-sm text-muted-foreground text-center">No hay estructura definida.</div>
    }

    return (
        <div className="space-y-1">
            {sections.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map(section => (
                <BlueprintItem
                    key={section.id}
                    section={section}
                    onSelect={onSelectSection}
                    onGenerate={onGenerateDraft}
                    selectedId={selectedSectionId}
                    depth={0}
                />
            ))}
        </div>
    )
}

function BlueprintItem({ section, onSelect, onGenerate, selectedId, depth }: any) {
    const [expanded, setExpanded] = useState(true)
    const hasChildren = section.children && section.children.length > 0
    const isSelected = selectedId === section.id
    const [generating, setGenerating] = useState(false)

    const handleGenerate = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setGenerating(true)
        await onGenerate(section.id)
        setGenerating(false)
    }

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent group text-sm",
                    isSelected && "bg-accent text-accent-foreground font-medium",
                    depth > 0 && "ml-4"
                )}
                onClick={() => onSelect(section)}
            >
                {hasChildren ? (
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} className="p-0.5 hover:bg-muted rounded">
                        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                ) : (
                    <FileText className="h-3 w-3 text-muted-foreground" />
                )}

                <span className="flex-1 truncate">{section.title}</span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={handleGenerate}
                    title="Generar Borrador con IA"
                    disabled={generating}
                >
                    {generating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-primary" />}
                </Button>
            </div>

            {hasChildren && expanded && (
                <div className="border-l border-muted ml-3 pl-1">
                    {section.children.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)).map((child: any) => (
                        <BlueprintItem
                            key={child.id}
                            section={child}
                            onSelect={onSelect}
                            onGenerate={onGenerate}
                            selectedId={selectedId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
