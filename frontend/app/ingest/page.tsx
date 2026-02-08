"use client"

import { useState, Suspense } from "react"
import { IngestForm } from "@/components/ingest/IngestForm"
import { IngestResults } from "@/components/ingest/IngestResults"
import { useLanguage } from "@/contexts/LanguageContext"

export default function IngestPage() {
    const { t } = useLanguage()
    const [result, setResult] = useState<any>(null)

    return (
        <div className="flex justify-center p-6 lg:p-10">
            <div className="w-full max-w-3xl space-y-8">

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t("ingestTitle")}</h1>
                    <p className="text-muted-foreground">{t("ingestSubtitle")}</p>
                </div>

                {result ? (
                    <IngestResults data={result} onReset={() => setResult(null)} />
                ) : (
                    <Suspense fallback={<div>{t("loadingForm")}</div>}>
                        <IngestForm onSuccess={setResult} />
                    </Suspense>
                )}
            </div>
        </div>
    )
}
