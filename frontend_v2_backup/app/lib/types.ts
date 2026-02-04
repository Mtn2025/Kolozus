export interface Fragment {
    id: string;
    raw_text: string;
    source: string;
    created_at: string;
    embedding?: number[];
}

export interface Idea {
    id: string;
    title_provisional: string;
    domain: string;
    status: string;
    created_at: string;
    updated_at?: string;
    semantic_profile?: {
        centroid: number[];
        fragment_count: number;
        radius: number;
    };
}

export interface IdeaVersion {
    id: string;
    idea_id: string;
    version_number: number;
    stage: string;
    synthesized_text: string;
    reasoning_log: string;
    created_at: string;
}

export interface DecisionLog {
    id: string;
    fragment_id: string;
    target_idea_id?: string;
    timestamp: string;
    action: string;
    confidence: number;
    rule_id: string;
    reasoning: string;
    meta?: LogMetadata;
}

export interface LogMetadata {
    engine_v?: string;
    rules_v?: string;
    emb_provider?: string;
    emb_model?: string;
    prompt_hash?: string;
    constraints?: string[];
}

export interface GraphNode {
    id: string;
    label: string;
    status: string;
    weight: number;
}

export interface SearchResult {
    id: string;
    title: string;
    status: string;
    similarity: number;
    domain: string;
}

export interface ReplayResult {
    fragment_id: string;
    engine_version: string;
    rules_version: string;
    original_decision_summary: {
        action: string;
        target?: string;
        confidence?: number;
    } | null;
    replay_decision: {
        action: string;
        target?: string;
        confidence: number;
        reasoning: string;
        rule_id: string;
    };
    drift_detected: boolean;
    drift_reason?: string;
}
