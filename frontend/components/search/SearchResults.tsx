"use client"

import { FileText, Cpu, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MaturityIndicator } from "@/components/library/MaturityIndicator"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
    id: string
    title: string
    status: string
    similarity: number
    domain?: string
    maturity?: {
        score: number
        status: string
        emoji: string
        ready_for_product: boolean
    }
    metrics?: {
        fragment_count: number
        version_count: number
        age_days: number
    }
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
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-primary/10 rounded-full mt-1">
                                    <Cpu className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <div className="font-medium">{r.title || "Sin título"}</div>
                                        <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {r.status}
                                            </Badge>
                                            {r.similarity > 0 && <span>• Similitud: {(r.similarity * 100).toFixed(0)}%</span>}
                                            {r.domain && <span>• {r.domain}</span>}
                                        </div>
                                    </div>

                                    {/* Maturity Indicator if available */}
                                    {r.maturity && r.metrics && (
                                        <MaturityIndicator
                                            maturity={r.maturity}
                                            metrics={r.metrics}
                                            compact={true}
                                        />
                                    )}
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50 mt-2" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
