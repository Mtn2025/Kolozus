"use client"

import { useState, useEffect } from "react"
import { UploadCloud, FileText, Layers, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/services/api"
import { Space } from "@/types"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

interface IngestFormProps {
    onSuccess: (data: any) => void
}

export function IngestForm({ onSuccess }: IngestFormProps) {
    const searchParams = useSearchParams()
    const defaultSpaceId = searchParams.get("space_id")

    const [loading, setLoading] = useState(false)
    const [spaces, setSpaces] = useState<Space[]>([])

    // Form State
    const [text, setText] = useState("")
    const [spaceId, setSpaceId] = useState<string>(defaultSpaceId || "")
    const [isBatch, setIsBatch] = useState(false)
    const [mode, setMode] = useState("default")

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const res = await api.get<Space[]>("/spaces/")
                setSpaces(res.data)
            } catch (e) {
                console.error(e)
            }
        }
        fetchSpaces()
    }, [])

    useEffect(() => {
        if (defaultSpaceId) setSpaceId(defaultSpaceId)
    }, [defaultSpaceId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !spaceId) return

        setLoading(true)
        try {
            let response
            if (isBatch) {
                // Client-side splitting logic
                const texts = text.split(/\n\n+/).filter(t => t.trim().length > 0)
                const payload = {
                    texts: texts,
                    space_id: spaceId,
                    mode: mode
                }
                response = await api.post("/ingest/batch", payload)
            } else {
                const payload = {
                    text: text,
                    space_id: spaceId,
                    mode: mode
                }
                response = await api.post("/ingest/", payload)
            }

            onSuccess(response.data)
            setText("") // Clear form on success
            toast.success("Ingesta completada correctamente")
        } catch (error) {
            console.error("Ingest failed", error)
            toast.error("Error al ingerir texto. Revisa la consola.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Ingesta de Conocimiento</CardTitle>
                <CardDescription>
                    Transforma texto crudo en fragmentos cognitivos e ideas conectadas.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Space Selection */}
                    <div className="space-y-2">
                        <Label>Espacio de Destino</Label>
                        <Select value={spaceId} onValueChange={setSpaceId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un espacio..." />
                            </SelectTrigger>
                            <SelectContent>
                                {spaces.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mode & Batch Toggles */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Modo por Lotes</Label>
                            <div className="text-xs text-muted-foreground">
                                Separa por doble salto de línea (\n\n)
                            </div>
                        </div>
                        <Switch checked={isBatch} onCheckedChange={setIsBatch} />
                    </div>

                    {/* Text Area */}
                    <div className="space-y-2">
                        <Label>Contenido</Label>
                        <Textarea
                            placeholder="Pega aquí tu texto, notas o extractos..."
                            className="min-h-[200px] font-mono text-sm"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {text.length} caracteres
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button type="submit" disabled={loading || !spaceId || !text.trim()}>
                        {loading ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Ingestar {isBatch ? "(Batch)" : ""}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
