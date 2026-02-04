"use client"

import { useEffect, useState } from "react"
import { SpaceList } from "@/components/spaces/SpaceList"
import { CreateSpaceDialog } from "@/components/spaces/CreateSpaceDialog"
import { api } from "@/services/api"
import { Space } from "@/types"

export default function SpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSpaces = async () => {
        setLoading(true)
        try {
            const res = await api.get<Space[]>("/spaces/")
            setSpaces(res.data)
        } catch (error) {
            console.error("Error fetching spaces", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este espacio? Esta acción no se puede deshacer.")) return

        try {
            await api.delete(`/spaces/${id}`)
            fetchSpaces() // Refresh list
        } catch (error) {
            console.error("Error deleting space", error)
        }
    }

    useEffect(() => {
        fetchSpaces()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Espacios de Conocimiento</h2>
                    <p className="text-muted-foreground">Gestiona tus áreas de investigación y curación.</p>
                </div>
                <CreateSpaceDialog onSpaceCreated={fetchSpaces} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-pulse text-muted-foreground">Cargando espacios...</div>
                </div>
            ) : (
                <SpaceList spaces={spaces} onDelete={handleDelete} />
            )}
        </div>
    )
}
