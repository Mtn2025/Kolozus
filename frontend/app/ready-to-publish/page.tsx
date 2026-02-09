"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MaturityIndicator } from "@/components/library/MaturityIndicator"
import { CreateProductDialog } from "@/components/library/CreateProductDialog"
import { api } from "@/services/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface MatureIdea {
    id: string
    title: string
    maturity_score: number
    maturity_status: string
    fragment_count: number
    space_id: string
    domain?: string
}

export default function ReadyToPublishPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [ideas, setIdeas] = useState<MatureIdea[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)

    useEffect(() => {
        fetchMatureIdeas()
    }, [])

    const fetchMatureIdeas = async () => {
        setLoading(true)
        try {
            // Get all spaces and aggregate mature ideas
            const spacesRes = await api.get<any[]>("/spaces/")
            const allMatureIdeas: MatureIdea[] = []

            for (const space of spacesRes.data) {
                try {
                    const analyticsRes = await api.get(`/spaces/${space.id}/analytics`)
                    const matureIdeasFromSpace = analyticsRes.data.top_ideas
                        .filter((idea: any) => idea.maturity_score >= 60)
                        .map((idea: any) => ({
                            ...idea,
                            space_id: space.id,
                            space_name: space.name
                        }))
                    allMatureIdeas.push(...matureIdeasFromSpace)
                } catch (err) {
                    console.error(`Error fetching analytics for space ${space.id}`, err)
                }
            }

            // Sort by maturity score
            allMatureIdeas.sort((a, b) => b.maturity_score - a.maturity_score)
            setIdeas(allMatureIdeas)
        } catch (error) {
            console.error("Error fetching mature ideas", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="text-center space-y-2">
                    <div className="text-lg font-medium">Cargando ideas maduras...</div>
                    <div className="text-sm text-muted-foreground">Analizando espacios</div>
                </div>
            </div>
        )
    }

    if (ideas.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            No hay ideas maduras aún
                        </CardTitle>
                        <CardDescription>
                            Las ideas necesitan acumular fragmentos, consolidaciones y tiempo para madurar.
                            Continúa ingresando contenido para ver ideas aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/ingest")} className="w-full">
                            Ir a Ingesta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Listas para Publicar
                </h1>
                <p className="text-muted-foreground mt-2">
                    Ideas con madurez ≥ 60% listas para convertir en productos editoriales
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold">{ideas.length}</CardTitle>
                        <CardDescription>Ideas Maduras</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold">
                            {Math.round(ideas.reduce((sum, i) => sum + i.maturity_score, 0) / ideas.length)}%
                        </CardTitle>
                        <CardDescription>Madurez Promedio</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold">
                            {ideas.reduce((sum, i) => sum + i.fragment_count, 0)}
                        </CardTitle>
                        <CardDescription>Fragmentos Totales</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Ideas List */}
            <div className="grid grid-cols-1 gap-4">
                {ideas.map((idea) => (
                    <Card key={idea.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{idea.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline">
                                                {idea.domain || "Sin clasificar"}
                                            </Badge>
                                            <span>•</span>
                                            <span>{idea.fragment_count} fragmentos</span>
                                        </div>
                                    </div>

                                    {/* Maturity Indicator */}
                                    <MaturityIndicator
                                        maturity={{
                                            score: idea.maturity_score,
                                            status: idea.maturity_status,
                                            emoji: idea.maturity_score >= 70 ? "🌳" : "🌿",
                                            ready_for_product: true
                                        }}
                                        metrics={{
                                            fragment_count: idea.fragment_count,
                                            version_count: 0,
                                            age_days: 0
                                        }}
                                        compact={true}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/library/idea/${idea.id}`)}
                                    >
                                        Ver Detalle
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>

                                    <CreateProductDialog
                                        ideaId={idea.id}
                                        ideaTitle={idea.title}
                                        spaceId={idea.space_id}
                                        trigger={
                                            <Button size="sm" className="w-full">
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Crear Producto
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
