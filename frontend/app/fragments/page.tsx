"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Trash2, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/services/api"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Fragment {
    id: string
    raw_text: string
    created_at: string
    source: string
    idea_id?: string
    space_id?: string
}

export default function FragmentsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const spaceId = searchParams?.get("space_id")

    const [fragments, setFragments] = useState<Fragment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingIds, setDeletingIds] = useState<string[]>([])

    useEffect(() => {
        fetchFragments()
    }, [spaceId])

    const fetchFragments = async () => {
        setLoading(true)
        try {
            // If space_id provided, filter by space
            const endpoint = spaceId ? `/fragments?space_id=${spaceId}` : '/fragments'
            const res = await api.get<Fragment[]>(endpoint)
            setFragments(res.data)
        } catch (error) {
            console.error("Error loading fragments", error)
            toast.error("Error cargando fragmentos")
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const selectAll = () => {
        if (selectedIds.size === fragments.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(fragments.map(f => f.id)))
        }
    }

    const handleDeleteConfirm = () => {
        setDeletingIds(Array.from(selectedIds))
        setDeleteDialogOpen(true)
    }

    const executeDelete = async () => {
        try {
            // Soft delete each fragment
            for (const id of deletingIds) {
                await api.post(`/trash/fragment/${id}`)
            }

            toast.success(`${deletingIds.length} fragmento(s) enviado(s) a papelera`)

            // Remove from UI
            setFragments(fragments.filter(f => !deletingIds.includes(f.id)))
            setSelectedIds(new Set())
            setDeletingIds([])
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error("Error deleting fragments", error)
            toast.error("Error al eliminar fragmentos")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const truncateText = (text: string, maxLength = 150) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="text-center space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <div className="text-lg font-medium">Cargando fragmentos...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {spaceId && (
                        <Link href={`/spaces/${spaceId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestión de Fragmentos
                        </h1>
                        <p className="text-muted-foreground">
                            {spaceId ? "Fragmentos del espacio actual" : "Todos los fragmentos"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchFragments}
                        size="sm"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refrescar
                    </Button>
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            size="sm"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar ({selectedIds.size})
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl">{fragments.length}</CardTitle>
                        <CardDescription>Total de Fragmentos</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl">{selectedIds.size}</CardTitle>
                        <CardDescription>Seleccionados</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl">
                            {fragments.filter(f => f.idea_id).length}
                        </CardTitle>
                        <CardDescription>Asignados a Ideas</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Select All */}
            {fragments.length > 0 && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                    <Checkbox
                        checked={selectedIds.size === fragments.length}
                        onCheckedChange={selectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                        {selectedIds.size === fragments.length ? "Deseleccionar todo" : "Seleccionar todo"}
                    </label>
                </div>
            )}

            {/* Fragments List */}
            {fragments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No hay fragmentos {spaceId && "en este espacio"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {fragments.map((fragment) => (
                        <Card
                            key={fragment.id}
                            className={`transition-all ${selectedIds.has(fragment.id) ? "border-primary bg-primary/5" : ""
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={selectedIds.has(fragment.id)}
                                        onCheckedChange={() => toggleSelection(fragment.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-sm leading-relaxed">
                                                {truncateText(fragment.raw_text)}
                                            </p>
                                            {fragment.idea_id && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <Badge variant="outline" className="text-xs">
                                                {fragment.source || "manual"}
                                            </Badge>
                                            <span>•</span>
                                            <span>{formatDate(fragment.created_at)}</span>
                                            {fragment.idea_id && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-green-600">Asignado a idea</span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span className="font-mono text-xs">
                                                {fragment.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar fragmentos?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vas a eliminar {deletingIds.length} fragmento(s).
                            Esta acción los moverá a la papelera (soft delete).
                            {deletingIds.length > 0 && fragments.filter(f => deletingIds.includes(f.id) && f.idea_id).length > 0 && (
                                <span className="block mt-2 text-yellow-600 font-medium">
                                    ⚠️ Algunos fragmentos están asignados a ideas.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
