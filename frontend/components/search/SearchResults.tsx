"use client"

import { FileText, Cpu, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SearchResult {
    id: string
    title: string
    status: string
    similarity: number
    domain?: string
}

interface SearchResultsProps {
    results: SearchResult[]
    onSelect?: (id: string) => void
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
    if (results.length === 0) {
        return null
    }

    return (
        <div className="space-y-2 mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Resultados Semánticos</h3>
            {results.map((r) => (
                <Card
                    key={r.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelect && onSelect(r.id)}
                >
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium">{r.title || "Sin título"}</div>
                                <div className="text-xs text-muted-foreground flex gap-2">
                                    <span>{r.status}</span>
                                    {r.similarity > 0 && <span>• Similitud: {(r.similarity * 100).toFixed(0)}%</span>}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
