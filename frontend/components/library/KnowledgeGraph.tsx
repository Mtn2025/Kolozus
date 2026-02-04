"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

import { Card } from "@/components/ui/card"
import { api } from "@/services/api"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import ForceGraph with no SSR
const ForceGraph2DNoSSR = dynamic(
    () => import("react-force-graph-2d"),
    { ssr: false, loading: () => <div className="p-4 text-sm text-muted-foreground">Cargando Grafo...</div> }
)

interface GraphNode {
    id: string
    label: string
    status: string
    weight: number
    x?: number
    y?: number
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

export function KnowledgeGraph() {
    const { theme } = useTheme()
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const fgRef = useRef<any>(null)

    // Colors based on theme
    const isDark = theme === "dark" || theme === "midnight" || theme === "carbon" || theme?.includes("dark")
    const bgColor = "rgba(0,0,0,0)" // Transparent to let Card bg show
    const nodeColor = isDark ? "#fff" : "#333"
    const linkColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                // Fetch nodes
                const res = await api.get<any[]>("/query/knowledge-graph")
                // Transform to graph format
                const nodes = res.data.map(n => ({
                    id: n.id,
                    label: n.label || "Sin Título",
                    status: n.status,
                    weight: n.weight || 1
                }))

                // MOCK LINKS for visualization (since backend doesn't return edges yet)
                // Connect nodes randomly just to show structure if count > 1
                const links: GraphLink[] = []
                if (nodes.length > 1) {
                    for (let i = 1; i < nodes.length; i++) {
                        // Connect to a previous node mostly
                        const targetIndex = Math.floor(Math.random() * i)
                        links.push({
                            source: nodes[i].id,
                            target: nodes[targetIndex].id,
                            value: 1
                        })
                    }
                }

                setData({ nodes, links })
            } catch (error) {
                console.error("Error fetching graph", error)
            }
        }
        fetchGraph()
    }, [])

    return (
        <Card className={`relative overflow-hidden border ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : 'h-[600px]'}`}>
            <div className="absolute top-2 right-2 z-10">
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
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Visualización vacía. Ingesta texto para generar nodos.
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
                        linkColor={() => linkColor}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        d3VelocityDecay={0.1}
                        onNodeClick={(node: any) => {
                            // Zoom to node
                            fgRef.current?.centerAt(node.x, node.y, 1000)
                            fgRef.current?.zoom(8, 2000)
                        }}
                    />
                )}
            </div>
        </Card>
    )
}
