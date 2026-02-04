export interface Space {
    id: string; // UUID
    name: string;
    description?: string | null;
    color?: string;
    created_at: string;
}

export interface Fragment {
    id: string;
    raw_text: string;
    source?: string;
    created_at: string;
    space_id?: string;
    language?: string;
}

export interface Product {
    id: string;
    title: string;
    archetype: string;
    status?: string;
    space_id: string;
    created_at?: string;
    sections?: ProductSection[];
}

export interface ProductSection {
    id: string;
    title: string;
    content?: string;
    children?: ProductSection[];
    order_index?: number;
}
