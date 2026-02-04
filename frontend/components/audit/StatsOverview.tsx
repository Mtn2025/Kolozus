"use client"

import { Database, FolderKanban, FileStack, BrainCircuit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemCounts, VectorStats } from "@/types/audit"

interface StatsOverviewProps {
    counts: SystemCounts | null
    vectors: VectorStats | null
    loading: boolean
}

export function StatsOverview({ counts, vectors, loading }: StatsOverviewProps) {
    if (loading || !counts) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
    </div>

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Espacios Activos"
                value={counts.spaces}
                icon={FolderKanban}
            />
            <StatsCard
                title="Productos Editoriales"
                value={counts.products}
                icon={FileStack}
            />
            <StatsCard
                title="Total Embeddings"
                value={counts.fragments} // or vectors?.total_embeddings
                subtext={`${Object.keys(vectors?.spaces_breakdown || {}).length} Espacios indexados`}
                icon={Database}
            />
            <StatsCard
                title="Decisiones Cognitivas"
                value={counts.decisions_logged}
                icon={BrainCircuit}
            />
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, subtext }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </CardContent>
        </Card>
    )
}
