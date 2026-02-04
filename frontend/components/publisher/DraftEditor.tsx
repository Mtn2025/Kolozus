"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ProductSection } from "@/types"

interface DraftEditorProps {
    section: ProductSection | null
    onSave: (id: string, content: string) => void
}

export function DraftEditor({ section, onSave }: DraftEditorProps) {
    const [content, setContent] = useState("")
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (section) {
            setContent(section.content || "")
            setIsDirty(false)
        }
    }, [section])

    const handleSave = () => {
        if (section) {
            onSave(section.id, content)
            setIsDirty(false)
        }
    }

    if (!section) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                Selecciona una sección del blueprint para editar.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <Label className="text-xs text-muted-foreground uppercase">Editando Sección</Label>
                    <h3 className="text-lg font-bold">{section.title}</h3>
                </div>
                <Button onClick={handleSave} disabled={!isDirty}>
                    Guardar Cambios
                </Button>
            </div>

            <Textarea
                className="flex-1 font-mono text-base p-4 resize-none focus-visible:ring-0 border-0 shadow-none bg-background"
                placeholder="Escribe o genera contenido..."
                value={content}
                onChange={(e) => {
                    setContent(e.target.value)
                    setIsDirty(true)
                }}
            />
        </div>
    )
}
