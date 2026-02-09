"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Cpu, Calendar, Tag, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "sonner"
import { MaturityIndicator } from "@/components/library/MaturityIndicator"
import { CreateProductDialog } from "@/components/library/CreateProductDialog"

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

interface Idea {
    id: string
    title_provisional?: string
    title?: string
    summary?: string
    status: string
    domain?: string
    created_at: string
    updated_at?: string
    space_id?: string
    maturity?: MaturityData
    metrics?: MetricsData
    fragments?: Array<{
        id: string
        raw_text?: string
        text?: string
        created_at: string
    }>
}

export default function IdeaDetailPage() {
    const { t } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const [idea, setIdea] = useState<Idea | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadIdea()
    }, [params.id])

    const loadIdea = async () => {
        try {
            setLoading(true)
            // Try to fetch idea from backend
            const res = await api.get(`/query/idea/${params.id}`)
            setIdea(res.data)
        } catch (error) {
            console.error("Error loading idea:", error)
            toast.error("No se pudo cargar la idea")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="text-muted-foreground animate-pulse">
                    {t("loading")}
                </div>
            </div>
        )
    }

    if (!idea) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
                <div className="text-2xl font-bold">404</div>
                <div className="text-muted-foreground">Idea no encontrada</div>
                <Button onClick={() => router.push("/library")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Biblioteca
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/library")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("library")}
                </Button>

                {/* Create Product Button - Show if ready */}
                {idea.maturity?.ready_for_product && (
                    <CreateProductDialog
                        ideaId={idea.id}
                        ideaTitle={idea.title_provisional || idea.title || ""}
                        spaceId={idea.space_id}
                    />
                )}
            </div>

            {/* Main Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Cpu className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">
                                {idea.title_provisional || idea.title || "Sin título"}
                            </CardTitle>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {idea.status}
                                </div>
                                {idea.domain && (
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {idea.domain}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(idea.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Maturity Indicator */}
                    {idea.maturity && idea.metrics && (
                        <MaturityIndicator
                            maturity={idea.maturity}
                            metrics={idea.metrics}
                        />
                    )}

                    {/* Summary */}
                    {idea.summary && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Resumen</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {idea.summary}
                            </p>
                        </div>
                    )}

                    {/* Related Fragments */}
                    {idea.fragments && idea.fragments.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">
                                Fragmentos relacionados ({idea.fragments.length})
                            </h3>
                            <div className="space-y-3">
                                {idea.fragments.map((fragment) => (
                                    <Card key={fragment.id} className="bg-muted/30">
                                        <CardContent className="p-4">
                                            <p className="text-sm leading-relaxed">
                                                {fragment.raw_text || fragment.text}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {new Date(fragment.created_at).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
