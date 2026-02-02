import { Fragment, Idea, IdeaVersion, DecisionLog, GraphNode, SearchResult, ReplayResult } from "./types";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Inject Language Header
    const lang = typeof window !== "undefined" ? localStorage.getItem("kolozus_language") || "en" : "en";
    const headers = {
        ...(options?.headers || {}),
        "Accept-Language": lang
    } as HeadersInit;

    const res = await fetch(`${BASE_URL}${endpoint}`, { cache: "no-store", ...options, headers });
    if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

export interface Space {
    id: string;
    name: string;
    description?: string;
    color: string;
}

export interface Product {
    id: string;
    title: string;
    archetype: string;
    style_family: string;
    design_overrides?: any;
    status: string;
    space_id: string;
    sections?: ProductSection[];
    created_at: string;
}

export interface ProductSection {
    id: string;
    product_id: string;
    parent_id?: string;
    title: string;
    content?: string;
    order_index: number;
    intervention_level: number;
    subsections?: ProductSection[];
}

export const api = {
    // --- SPACES ---
    getSpaces: () => fetchJson<Space[]>("/spaces/"),

    getSpace: (id: string) => fetchJson<Space>(`/spaces/${id}`),

    createSpace: (name: string, description?: string) => fetchJson<Space>("/spaces/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
    }),

    getFragments: (spaceId?: string) => {
        const query = spaceId ? `?space_id=${spaceId}&limit=100` : "?limit=100";
        return fetchJson<Fragment[]>(`/query/fragments${query}`);
    },

    getFragment: (id: string) => fetchJson<Fragment>(`/query/fragment/${id}`),

    getFragmentAudit: (id: string) => fetchJson<DecisionLog[]>(`/audit/fragment/${id}`),

    getKnowledgeGraph: (spaceId?: string) => {
        const query = spaceId ? `?space_id=${spaceId}` : "";
        return fetchJson<GraphNode[]>(`/query/knowledge-graph${query}`);
    },

    getIdea: (id: string) => fetchJson<Idea>(`/query/idea/${id}`),

    getIdeaHistory: (id: string) => fetchJson<IdeaVersion[]>(`/query/idea/${id}/history`),

    getIdeaFragments: (id: string) => fetchJson<Fragment[]>(`/query/idea/${id}/fragments`),

    searchKnowledge: (query: string, spaceId?: string) => fetchJson<SearchResult[]>("/query/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, space_id: spaceId })
    }),

    replayDecision: (fragmentId: string) => fetchJson<ReplayResult>(`/audit/replay/${fragmentId}`, { method: "POST" }),

    ingestFragment: (text: string, spaceId?: string, mode: string = "default") => fetchJson<any>("/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: "web-ui", mode, space_id: spaceId })
    }),

    ingestBatch: (items: { text: string; source?: string }[], spaceId?: string, mode: string = "default") => fetchJson<any[]>("/ingest/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, mode, space_id: spaceId })
    }),

    // Data Management (Trash)
    listTrash: () => fetchJson<Fragment[]>("/trash/"),
    moveToTrash: (id: string) => fetchJson(`/trash/fragment/${id}`, { method: "POST" }),
    restoreFromTrash: (id: string) => fetchJson(`/trash/restore/fragment/${id}`, { method: "POST" }),
    permanentDelete: (id: string) => fetchJson(`/trash/permanent/fragment/${id}`, { method: "DELETE" }),
    batchMoveToTrash: (ids: string[]) => fetchJson("/trash/batch/fragments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
    }),

    // --- PRODUCTS ---
    getProducts: (spaceId: string) => fetchJson<Product[]>(`/products/?space_id=${spaceId}`),

    createProduct: (title: string, spaceId: string, archetype: string, styleFamily: string) => fetchJson<Product>("/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, space_id: spaceId, archetype, style_family: styleFamily })
    }),

    getProduct: (id: string) => fetchJson<Product>(`/products/${id}`),

    addSection: (productId: string, title: string, parentId?: string) => fetchJson<ProductSection>(`/products/${productId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, parent_id: parentId })
    }),

    draftSection: (productId: string, sectionId: string, level: number) => fetchJson<ProductSection>(`/products/${productId}/sections/${sectionId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level })
    }),

    previewProduct: (productId: string) => fetchJson<string>(`/products/${productId}/preview`),

    updateProduct: (productId: string, overrides: any) => fetchJson<Product>(`/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design_overrides: overrides })
    }),

    generateBlueprint: (productId: string) => fetchJson<ProductSection[]>(`/products/${productId}/blueprint`, {
        method: "POST"
    }),

    // --- UI CONFIG ---
    getUIConfig: () => fetchJson<{ theme: string }>("/ui/config"),

    updateUIConfig: (theme: string) => fetchJson("/ui/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
    })
};
