"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function PublisherPage() {
    const { t } = useLanguage()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await api.get("/products/")
                setProducts(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("publisherTitle")}</h1>
                <p className="text-muted-foreground">{t("publisherSubtitle")}</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                    {t("loadingProducts")}
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Product list would go here */}
                    <p className="text-sm text-muted-foreground">{t("myProducts")}</p>
                </div>
            )}
        </div>
    )
}
