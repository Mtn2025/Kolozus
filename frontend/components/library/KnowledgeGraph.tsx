"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

import { Card } from "@/components/ui/card"
import { api } from "@/services/api"
import { Maximize, Minimize, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Dynamically import ForceGraph with no SSR
const ForceGraph2DNoSSR = dynamic(
    () => import("react-force-graph-2d"),
    {
        ssr: false, loading: () => {
            const { t } = require("@/contexts/LanguageContext").useLanguage()
            return <div className="p-4 text-sm text-muted-foreground">{t("loadingGraph")}</div>
        }
    }
)

interface GraphNode {
    id: string
    label: string
    status: string
    weight: number
    domain?: string
    x?: number
    y?: number
}

interface GraphEdge {
    source: string
    target: string
    similarity: number
}

interface GraphLink {
    source: string
    target: string
    value: number
}

interface GraphData {
    nodes: GraphNode[]
    links: GraphLink[]
}

interface KnowledgeGraphResponse {
    nodes: GraphNode[]
    edges: GraphEdge[]
    metadata: {
        total_nodes: number
        total_edges: number
        space_id: string | null
    }
}

export function KnowledgeGraph() {
    const { theme } = useTheme()
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [metadata, setMetadata] = useState<any>(null)
    const [selectedDomains, setSelectedDomains] = useState<string[]>([])
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
    const fgRef = useRef<any>(null)

    // Colors based on theme
    const isDark = theme === "dark" || theme === "onyx" || theme === "bloomberg" || theme === "obsidian"
    const bgColor = "rgba(0,0,0,0)" // Transparent to let Card bg show
    const nodeColor = isDark ? "#fff" : "#333"
    const linkColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                // Fetch knowledge graph for all spaces
                const url = "/query/knowledge-graph"

                // Fetch graph data with new format
                const res = await api.get<KnowledgeGraphResponse>(url)
                const graphData = res.data

                // Transform nodes
                const nodes = graphData.nodes.map(n => ({
                    id: n.id,
                    label: n.label || "Sin Título",
                    status: n.status,
                    weight: n.weight || 1,
                    domain: n.domain
                }))

                // Transform edges from backend (real similarity-based edges)
                const links: GraphLink[] = graphData.edges.map(e => ({
                    source: e.source,
                    target: e.target,
                    value: e.similarity // Use similarity as link strength
                }))

                setData({ nodes, links })
                setMetadata(graphData.metadata)
            } catch (error) {
                console.error("Error fetching graph", error)
            }
        }
        fetchGraph()
    }, []) // Refetch when space changes

    const getStatusColor = (status: string) => {
        switch (status) {
            case "germinal": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
            case "developing": return "bg-blue-500/20 text-blue-700 dark:text-blue-300"
            case "mature": return "bg-green-500/20 text-green-700 dark:text-green-300"
            default: return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
        }
    }

    return (
        <div className="flex gap-4">
            <Card className={`relative overflow-hidden border ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : 'h-[600px]'} ${selectedNode ? 'w-2/3' : 'w-full'}`}>
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    {metadata && (
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                            {metadata.total_nodes} nodos • {metadata.total_edges} conexiones
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="bg-background/80 backdrop-blur-sm"
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="h-full w-full bg-card/50">
                    {data.nodes.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Info className="h-8 w-8 opacity-50" />
                            <p>Visualización vacía</p>
                            <p className="text-sm">Ingesta texto para generar nodos en este espacio</p>
                        </div>
                    ) : (
                        <ForceGraph2DNoSSR
                            ref={fgRef}
                            graphData={data}
                            width={isFullscreen ? window.innerWidth - 100 : undefined}
                            height={isFullscreen ? window.innerHeight - 100 : 598}
                            backgroundColor={bgColor}
                            nodeLabel="label"
                            nodeColor={() => nodeColor}
                            nodeRelSize={6}
                            nodeVal={(node: any) => node.weight * 2} // Size based on fragment count
                            linkColor={() => linkColor}
                            linkWidth={(link: any) => link.value * 2} // Thickness based on similarity
                            linkDirectionalParticles={2}
                            linkDirectionalParticleSpeed={0.005}
                            d3VelocityDecay={0.1}
                            onNodeClick={(node: any) => {
                                setSelectedNode(node as GraphNode)
                                // Zoom to node
                                fgRef.current?.centerAt(node.x, node.y, 1000)
                                fgRef.current?.zoom(3, 1000)
                            }}
                            onBackgroundClick={() => setSelectedNode(null)}
                        />
                    )}
                </div>
            </Card>

            {/* Detail Panel */}
            {selectedNode && !isFullscreen && (
                <Card className="h-[600px] w-1/3 overflow-y-auto p-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Detalle de Idea</h3>
                            <p className="text-sm text-muted-foreground break-words">
                                {selectedNode.label}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Estado:</span>
                                <Badge className={getStatusColor(selectedNode.status)}>
                                    {selectedNode.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Dominio:</span>
                                <span className="text-sm">{selectedNode.domain || "N/A"}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Fragments:</span>
                                <Badge variant="outline">{selectedNode.weight}</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">ID:</span>
                                <span className="text-xs font-mono">{selectedNode.id.slice(0, 8)}...</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button
                                onClick={() => window.open(`/library/idea/${selectedNode.id}`, '_blank')}
                                className="w-full"
                                size="sm"
                            >
                                Ver Detalles Completos
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
