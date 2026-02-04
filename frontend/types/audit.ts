export interface AuditLog {
    id: string
    timestamp: string
    action: string
    fragment_id: string
    target_idea_id?: string
    confidence?: number
    rule_id?: string
    reasoning?: string
    execution_time_ms?: number
}

export interface VectorStats {
    total_embeddings: number
    spaces_breakdown: Record<string, number>
}

export interface EntropyStats {
    cognitive_drift: number
    stability_percentage: number
    germinal_ideas: number
    consolidated_ideas: number
}

export interface SystemCounts {
    spaces: number
    products: number
    fragments: number
    decisions_logged: number
}
