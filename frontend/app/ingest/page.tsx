"use client"

import { useState } from "react"
import { IngestForm } from "@/components/ingest/IngestForm"
import { IngestResults } from "@/components/ingest/IngestResults"

export default function IngestPage() {
    const [result, setResult] = useState<any>(null)

    return (
        <div className="flex justify-center p-6 lg:p-10">
            <div className="w-full max-w-3xl space-y-8">

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Ingesta</h1>
                    <p className="text-muted-foreground">Alimenta tu sistema con nueva información.</p>
                </div>

                {result ? (
                    <IngestResults data={result} onReset={() => setResult(null)} />
                ) : (
                    <IngestForm onSuccess={setResult} />
                )}
            </div>
        </div>
    )
}
