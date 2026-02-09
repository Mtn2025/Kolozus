"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, TrendingUp, FileText, Lightbulb } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { api } from "@/services/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface SpaceAnalytics {
    space_id: string
    space_name: string
    total_fragments: number
    total_ideas: number
    maturity_distribution: {
        germinal: number
        growing: number
        mature: number
    }
    top_ideas: Array<{
        id: string
        title: string
        maturity_score: number
        maturity_status: string
        fragment_count: number
    }>
    ready_for_product: number
}

export default function SpaceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { t } = useLanguage()
    const id = params?.id as string

    const [analytics, setAnalytics] = useState<SpaceAnalytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        fetchAnalytics()
    }, [id])

    const fetchAnalytics = async () => {
        try {
            const res = await api.get<SpaceAnalytics>(`/spaces/${id}/analytics`)
            setAnalytics(res.data)
        } catch (error) {
            console.error("Error loading analytics", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "mature": return "bg-green-500"
            case "growing": return "bg-yellow-500"
            default: return "bg-gray-400"
        }
    }

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case "mature": return "🌳"
            case "growing": return "🌿"
            default: return "🌱"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="text-center space-y-2">
                    <div className="text-lg font-medium">Cargando espacio...</div>
                    <div className="text-sm text-muted-foreground">Analizando métricas</div>
                </div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Espacio no encontrado</CardTitle>
                        <CardDescription>No se pudo cargar la información del espacio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const totalIdeas = analytics.total_ideas
    const maturityPercentage = totalIdeas > 0
        ? Math.round((analytics.maturity_distribution.mature / totalIdeas) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{analytics.space_name}</h1>
                        <p className="text-muted-foreground">Métricas y análisis del espacio</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push("/ingest")} variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Ingestar Contenido
                    </Button>
                    {analytics.ready_for_product > 0 && (
                        <Button onClick={() => router.push("/ready-to-publish")}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Ideas Maduras ({analytics.ready_for_product})
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Fragmentos</CardDescription>
                        <CardTitle className="text-3xl">{analytics.total_fragments}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Contenido acumulado
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Ideas</CardDescription>
                        <CardTitle className="text-3xl">{analytics.total_ideas}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Ideas organizadas
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Madurez Global</CardDescription>
                        <CardTitle className="text-3xl">{maturityPercentage}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={maturityPercentage} className="h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Listas para Producto</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {analytics.ready_for_product}
                            {analytics.ready_for_product > 0 && <Sparkles className="h-5 w-5 text-primary" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Score ≥ 60%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Maturity Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribución de Madurez</CardTitle>
                    <CardDescription>Estado de las ideas en el espacio</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">🌱</div>
                            <div className="text-2xl font-bold">{analytics.maturity_distribution.germinal}</div>
                            <div className="text-sm text-muted-foreground">Germinales</div>
                            <div className="text-xs text-muted-foreground mt-1">0-30%</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">🌿</div>
                            <div className="text-2xl font-bold">{analytics.maturity_distribution.growing}</div>
                            <div className="text-sm text-muted-foreground">En Crecimiento</div>
                            <div className="text-xs text-muted-foreground mt-1">31-59%</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">🌳</div>
                            <div className="text-2xl font-bold">{analytics.maturity_distribution.mature}</div>
                            <div className="text-sm text-muted-foreground">Maduras</div>
                            <div className="text-xs text-muted-foreground mt-1">60-100%</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Ideas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top 10 Ideas Más Maduras
                    </CardTitle>
                    <CardDescription>Ideas con mayor score de madurez</CardDescription>
                </CardHeader>
                <CardContent>
                    {analytics.top_ideas.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay ideas aún. Comienza ingresando contenido.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analytics.top_ideas.map((idea, index) => (
                                <div
                                    key={idea.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => router.push(`/library/idea/${idea.id}`)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-2xl font-bold text-muted-foreground w-8">
                                            #{index + 1}
                                        </div>
                                        <div className="text-2xl">
                                            {getStatusEmoji(idea.maturity_status)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{idea.title}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {idea.maturity_status}
                                                </Badge>
                                                <span>•</span>
                                                <span>{idea.fragment_count} fragmentos</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{idea.maturity_score}%</div>
                                            <Progress value={idea.maturity_score} className="w-20 h-2 mt-1" />
                                        </div>
                                        {idea.maturity_score >= 60 && (
                                            <Sparkles className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
