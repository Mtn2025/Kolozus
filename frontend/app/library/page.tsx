"use client"

import { useState } from "react"
import { KnowledgeGraph } from "@/components/library/KnowledgeGraph"
import { SearchBar } from "@/components/search/SearchBar"
import { SearchResults } from "@/components/search/SearchResults"
import { api } from "@/services/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LibraryPage() {
    const { t } = useLanguage()
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
            console.error(t("searchError"), error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
            <div className="flex-none space-y-4 px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("libraryTitle")}</h1>
                    <p className="text-muted-foreground">{t("librarySubtitle")}</p>
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
                            {t("searchingConnections")}
                        </div>
                    ) : (
                        <SearchResults results={results} />
                    )}

                    {!loading && results.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg mt-4">
                            {t("semanticSearchHelp")}
                        </div>
                    )}
                </div>

                {/* Right Column: Knowledge Graph */}
                <div className="lg:col-span-2 min-h-0">
                    <KnowledgeGraph />
                </div>
            </div>
        </div>
    )
}
