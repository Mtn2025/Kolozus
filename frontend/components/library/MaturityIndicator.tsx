"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Sprout, Leaf, TreeDeciduous, TrendingUp } from "lucide-react"

interface MaturityData {
    score: number
    status: string
    emoji: string
    ready_for_product: boolean
}

interface MetricsData {
    fragment_count: number
    version_count: number
    age_days: number
}

interface MaturityIndicatorProps {
    maturity: MaturityData
    metrics: MetricsData
    compact?: boolean
}

export function MaturityIndicator({ maturity, metrics, compact = false }: MaturityIndicatorProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "germinal":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case "growing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "mature":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getIcon = (status: string) => {
        switch (status) {
            case "germinal":
                return <Sprout className="h-4 w-4" />
            case "growing":
                return <Leaf className="h-4 w-4" />
            case "mature":
                return <TreeDeciduous className="h-4 w-4" />
            default:
                return null
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "germinal":
                return "Germinal"
            case "growing":
                return "En Crecimiento"
            case "mature":
                return "Madura"
            default:
                return status
        }
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(maturity.status)}>
                    <span className="mr-1.5">{maturity.emoji}</span>
                    {getStatusLabel(maturity.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                    {maturity.score}%
                </span>
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getIcon(maturity.status)}
                        <h3 className="font-semibold">Madurez de la Idea</h3>
                    </div>
                    <Badge variant="outline" className={getStatusColor(maturity.status)}>
                        <span className="mr-1.5">{maturity.emoji}</span>
                        {getStatusLabel(maturity.status)}
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-medium">{maturity.score}/100</span>
                    </div>
                    <Progress value={maturity.score} className="h-2" />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">{metrics.fragment_count}</div>
                        <div className="text-xs text-muted-foreground">Fragmentos</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">{metrics.version_count}</div>
                        <div className="text-xs text-muted-foreground">Versiones</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">{metrics.age_days}</div>
                        <div className="text-xs text-muted-foreground">Días</div>
                    </div>
                </div>

                {/* Ready for Product */}
                {maturity.ready_for_product && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Lista para convertir en Producto
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
