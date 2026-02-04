"use client"

import Link from "next/link" // Import Link
import { Button } from "@/components/ui/button" // Import Button
import { UploadCloud } from "lucide-react"

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <h1 className="text-2xl font-bold">Detalle de Espacio</h1>
            <p className="text-muted-foreground">ID: {params.id}</p>

            <div className="flex gap-4">
                <Link href={`/ingest?space_id=${params.id}`}>
                    <Button>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Ingestar Texto
                    </Button>
                </Link>
            </div>

            <p className="text-sm bg-yellow-100 text-yellow-800 p-2 rounded max-w-md text-center">
                🚧 En Construcción: Próximamente visualización de Grafo y lista de fragmentos.
            </p>
        </div>
    )
}
