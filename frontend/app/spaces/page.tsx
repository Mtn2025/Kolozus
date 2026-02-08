"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SpacesPage() {
    const { t } = useLanguage()
    const [spaces, setSpaces] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSpaces() {
            try {
                const res = await api.get("/spaces/")
                setSpaces(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSpaces()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("spacesTitle")}</h1>
                <p className="text-muted-foreground">{t("spacesSubtitle")}</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                    {t("loadingSpaces")}
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Space list would go here */}
                </div>
            )}
        </div>
    )
}
