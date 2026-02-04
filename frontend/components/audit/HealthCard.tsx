"use client"

import { Activity, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EntropyStats } from "@/types/audit"
import { cn } from "@/lib/utils"

interface HealthCardProps {
    stats: EntropyStats | null
    loading: boolean
}

export function HealthCard({ stats, loading }: HealthCardProps) {
    if (loading || !stats) {
        return <SkeletonCard />
    }

    // Determine health color
    // 0-3: Good (Green), 3-6: Warning (Yellow), 6+: Critical (Red)
    let color = "text-green-500"
    let bg = "bg-green-500/10"
    let status = "Estable"

    if (stats.cognitive_drift > 3) {
        color = "text-yellow-500"
        bg = "bg-yellow-500/10"
        status = "Atención"
    }
    if (stats.cognitive_drift > 6) {
        color = "text-red-500"
        bg = "bg-red-500/10"
        status = "Crítico"
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
                <Activity className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className={cn("text-2xl font-bold", color)}>{stats.stability_percentage}%</div>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", bg, color)}>
                        {status}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                    Deriva Cognitiva: {stats.cognitive_drift} (Score)
                </p>
                <div className="mt-4 flex gap-4 text-xs">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Ideas Germinales</span>
                        <span className="font-semibold">{stats.germinal_ideas}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Consolidadas</span>
                        <span className="font-semibold">{stats.consolidated_ideas}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SkeletonCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
            </CardContent>
        </Card>
    )
}
