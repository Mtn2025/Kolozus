"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HealthCard } from "@/components/audit/HealthCard"
import { StatsOverview } from "@/components/audit/StatsOverview"
import { LogsTable } from "@/components/audit/LogsTable"
import { auditService } from "@/services/audit"
import { AuditLog, EntropyStats, SystemCounts, VectorStats } from "@/types/audit"

export default function AuditPage() {
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [entropy, setEntropy] = useState<EntropyStats | null>(null)
    const [counts, setCounts] = useState<SystemCounts | null>(null)
    const [vectors, setVectors] = useState<VectorStats | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchData = async () => {
        setRefreshing(true)
        try {
            const [logsRes, entropyRes, countsRes, vectorsRes] = await Promise.all([
                auditService.getLogs(50),
                auditService.getEntropyStats(),
                auditService.getSystemCounts(),
                auditService.getVectorStats()
            ])

            setLogs(logsRes.data)
            setEntropy(entropyRes.data)
            setCounts(countsRes.data)
            setVectors(vectorsRes.data)
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Audit fetch failed", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Initial Load
    useEffect(() => {
        fetchData()

        // Auto Refresh every 30s
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Observabilidad Cognitiva</h2>
                    <p className="text-muted-foreground">Monitorización en tiempo real del motor de decisión.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden md:inline">
                        Actualizado: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={refreshing}>
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
                {/* Stats taking 3/4 width on large screens */}
                <div className="md:col-span-4 space-y-6">
                    <StatsOverview counts={counts} vectors={vectors} loading={loading} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left: Health Card */}
                <div className="md:col-span-1">
                    <HealthCard stats={entropy} loading={loading} />

                    <div className="mt-4 p-4 rounded-lg bg-muted/20 border text-xs text-muted-foreground">
                        <h4 className="font-semibold mb-2">Motor de Reglas v2.1</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Semantic Threshold: 0.85</li>
                            <li>Entropy Tolerance: 6.0</li>
                            <li>Drift Detection: Active</li>
                        </ul>
                    </div>
                </div>

                {/* Right: Logs Stream */}
                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Feed de Decisiones</h3>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            Exportar CSV
                        </Button>
                    </div>
                    <LogsTable logs={logs} loading={loading} />
                </div>
            </div>
        </div>
    )
}
