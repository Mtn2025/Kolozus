"use client"

import { useState } from "react"
import { KnowledgeGraph } from "@/components/library/KnowledgeGraph"
import { SearchBar } from "@/components/search/SearchBar"
import { SearchResults } from "@/components/search/SearchResults"
import { api } from "@/services/api"

export default function LibraryPage() {
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/query/search", { query })
            setResults(res.data)
        } catch (error) {
            console.error("Search error", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
            <div className="flex-none space-y-4 px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Biblioteca Cognitiva</h1>
                    <p className="text-muted-foreground">Explora tu red de conocimiento.</p>
                </div>

                <div className="w-full max-w-xl">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
                {/* Left Column: Search Results */}
                <div className="lg:col-span-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                            Buscando conexiones semánticas...
                        </div>
                    ) : (
                        <SearchResults results={results} />
                    )}

                    {!loading && results.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg mt-4">
                            La búsqueda semántica encontrará ideas relacionadas conceptualmente.
                        </div>
                    )}
                </div>

                {/* Right Column: Graph (Takes 2/3) */}
                <div className="lg:col-span-2 h-full min-h-[400px]">
                    <KnowledgeGraph />
                </div>
            </div>
        </div>
    )
}
