"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { api } from '@/app/lib/api';
import { useLanguage } from '@/app/context/LanguageContext';
import { useSpace } from '@/app/lib/SpaceContext';
import { useRouter } from 'next/navigation';

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    status: string;
    weight: number;
    group?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number;
}

export default function KnowledgeGraph() {
    const svgRef = useRef<SVGSVGElement>(null);
    const { t } = useLanguage();
    const { currentSpace } = useSpace();
    const router = useRouter();
    const [data, setData] = useState<{ nodes: GraphNode[], links: GraphLink[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch nodes from backend
                const nodesData = await api.getKnowledgeGraph(currentSpace?.id);

                // Mock links for visualization if backend doesn't return them yet (API v1 only returns nodes)
                // In v2 backend we should return links. valid check.
                // For now, let's create random links or just nodes.
                // If nodes list is empty, handle gracefully.

                const nodes: GraphNode[] = nodesData.map(n => ({
                    ...n,
                    x: 0,
                    y: 0,
                    // Use weight to determine radius?
                }));

                // Heuristic linking for demo if no links provided
                // This simulates "relatedness"
                const links: GraphLink[] = [];
                // if (nodes.length > 1) {
                //      nodes.forEach((source, i) => {
                //         nodes.forEach((target, j) => {
                //             if (i < j && Math.random() > 0.85) {
                //                 links.push({ source: source.id, target: target.id, value: 1 });
                //             }
                //         });
                //      });
                // }

                setData({ nodes, links });
            } catch (e) {
                console.error("Graph fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentSpace]);

    useEffect(() => {
        if (!data || !svgRef.current) return;
        if (data.nodes.length === 0) return;

        const width = 800; // viewbox width
        const height = 600; // viewbox height

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous

        // Zoom capability
        const g = svg.append("g");

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Simulation
        const simulation = d3.forceSimulation<GraphNode>(data.nodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide<GraphNode>().radius(d => ((d as GraphNode).weight || 1) * 5 + 10));

        // Links
        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        // Nodes
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", d => (d.weight || 1) * 3 + 5)
            .attr("fill", d => {
                switch (d.status) {
                    case 'consolidada': return '#10b981'; // green
                    case 'maduración': return '#3b82f6'; // blue
                    case 'tension': return '#f59e0b'; // amber
                    default: return '#64748b'; // slate
                }
            })
            .attr("cursor", "pointer")
            .call(d3.drag<SVGCircleElement, GraphNode>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any
            )
            .on("click", (event, d) => {
                router.push(`/idea/${d.id}`);
            });

        // Labels
        const text = g.append("g")
            .selectAll("text")
            .data(data.nodes)
            .join("text")
            .text(d => d.label)
            .attr("font-size", "10px")
            .attr("dx", 12)
            .attr("dy", 4)
            .attr("fill", "currentColor")
            .attr("class", "text-foreground opacity-70");

        node.append("title")
            .text(d => d.label);

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as GraphNode).x!)
                .attr("y1", d => (d.source as GraphNode).y!)
                .attr("x2", d => (d.target as GraphNode).x!)
                .attr("y2", d => (d.target as GraphNode).y!);

            node
                .attr("cx", d => d.x!)
                .attr("cy", d => d.y!);

            text
                .attr("x", d => d.x!)
                .attr("y", d => d.y!);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

    }, [data, router]);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    if (!data || data.nodes.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-secondary/10">
            <span className="text-4xl mb-2">🕸️</span>
            <p className="text-muted-foreground">{t("Empty Graph")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("Ingest text to generate knowledge nodes.")}</p>
        </div>
    );

    return (
        <div className="w-full h-[600px] border border-border rounded-lg bg-background overflow-hidden relative shadow-inner">
            <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur p-2 rounded border border-border text-xs">
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> {t("Consolidated")}</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> {t("Maturation")}</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> {t("Tension/Germinal")}</div>
            </div>
            <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 600"></svg>
        </div>
    );
}
