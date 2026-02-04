export type ThemeKey = 'evo' | 'finance' | 'onyx' | 'obsidian' | 'illuminate' | 'rose' | 'canvas' | 'zen';

export interface ThemeDef {
    key: ThemeKey;
    name: string;
    description: string;
    category: 'Executive' | 'Luxury' | 'Creative' | 'Minimal';
    colors: {
        bg: string;
        primary: string;
    };
}

export const THEMES: ThemeDef[] = [
    // 1. Executive
    {
        key: 'evo',
        name: 'Evo Enterprise',
        description: 'The standard for SaaS. Clean blue-slate palette.',
        category: 'Executive',
        colors: { bg: 'bg-slate-50', primary: 'bg-blue-600' }
    },
    {
        key: 'finance',
        name: 'Bloomberg Terminal',
        description: 'Data-dense, high contrast teal and grey.',
        category: 'Executive',
        colors: { bg: 'bg-slate-200', primary: 'bg-teal-700' }
    },
    // 2. Luxury
    {
        key: 'onyx',
        name: 'Onyx Glass',
        description: 'Cyberpunk glassmorphism with neon accents.',
        category: 'Luxury',
        colors: { bg: 'bg-zinc-950', primary: 'bg-purple-600' }
    },
    {
        key: 'obsidian',
        name: 'Obsidian Gold',
        description: 'Matte black and muted gold. Serious elegance.',
        category: 'Luxury',
        colors: { bg: 'bg-black', primary: 'bg-yellow-600' }
    },
    // 3. Creative
    {
        key: 'illuminate',
        name: 'Illuminate Studio',
        description: 'Stark black and white. Maximum contrast.',
        category: 'Creative',
        colors: { bg: 'bg-white', primary: 'bg-black' }
    },
    {
        key: 'rose',
        name: 'Rose & Stone',
        description: 'Soft, warm, and welcoming. Editorial feel.',
        category: 'Creative',
        colors: { bg: 'bg-rose-50', primary: 'bg-rose-500' }
    },
    // 4. Minimal
    {
        key: 'canvas',
        name: 'Canvas Paper',
        description: 'Warm paper background, serif type. No distractions.',
        category: 'Minimal',
        colors: { bg: 'bg-orange-50', primary: 'bg-stone-800' }
    },
    {
        key: 'zen',
        name: 'Zen Garden',
        description: 'Calming sage greens and nature tones.',
        category: 'Minimal',
        colors: { bg: 'bg-green-50', primary: 'bg-green-700' }
    }
];
