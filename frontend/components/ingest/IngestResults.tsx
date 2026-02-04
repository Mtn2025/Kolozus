"use client"

import { CheckCircle2, Lightbulb, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface IngestResultsProps {
    data: any
    onReset: () => void
}

export function IngestResults({ data, onReset }: IngestResultsProps) {
    // Handle both single/batch response structures if they differ
    // Assumption: Single returns { fragment_id, ideas: [] }, Batch returns { fragments: [], total: 5 }

    const isBatch = Array.isArray(data.fragments) || data.total > 0
    const count = isBatch ? (data.fragments?.length || data.total) : 1

    return (
        <Card className="w-full border-green-500/20 bg-green-500/5">
            <CardHeader>
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                    <CardTitle>Ingestión Exitosa</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-foreground">
                    Se han procesado correctamente <strong>{count}</strong> fragmento(s).
                    El motor cognitivo está analizando las conexiones.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md bg-background p-4 border flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Estadísticas</span>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-lg font-bold">{count}</span>
                            <span className="text-sm">Fragmentos</span>
                        </div>
                    </div>
                    <div className="rounded-md bg-background p-4 border flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Ideas Generadas</span>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold">--</span>
                            <span className="text-xs text-muted-foreground">(Procesamiento asíncrono)</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onReset}>
                        Ingestar Más Contenido
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
