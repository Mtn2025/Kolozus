"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { Space, Product } from "@/types"

interface CreateProductDialogProps {
    onProductCreated: () => void
}

export function CreateProductDialog({ onProductCreated }: CreateProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [spaceId, setSpaceId] = useState("")
    const [archetype, setArchetype] = useState("non_fiction")

    // Data State
    const [spaces, setSpaces] = useState<Space[]>([])

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const res = await api.get<Space[]>("/spaces/")
                setSpaces(res.data)
                if (res.data.length > 0) setSpaceId(res.data[0].id)
            } catch (e) {
                console.error(e)
            }
        }
        if (open) fetchSpaces()
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post<Product>("/products/", {
                title,
                space_id: spaceId,
                archetype: archetype,
                style_family: "classic_publisher" // Default for now
            })
            setOpen(false)
            setTitle("")
            onProductCreated()
        } catch (error) {
            console.error("Failed to create product", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Producto Editorial</DialogTitle>
                        <DialogDescription>
                            Define el título y arquetipo para tu nueva publicación.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                                placeholder="El Futuro de la IA..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Espacio</Label>
                            <div className="col-span-3">
                                <Select value={spaceId} onValueChange={setSpaceId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {spaces.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Arquetipo</Label>
                            <div className="col-span-3">
                                <Select value={archetype} onValueChange={setArchetype}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="non_fiction">No Ficción (Ensayo)</SelectItem>
                                        <SelectItem value="textbook">Libro de Texto</SelectItem>
                                        <SelectItem value="report">Reporte Corporativo</SelectItem>
                                        <SelectItem value="blog_series">Serie de Artículos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !spaceId}>
                            {loading ? "Creando..." : "Crear Borrador"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
