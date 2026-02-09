"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { toast } from "sonner"
import { BookOpen, Sparkles } from "lucide-react"

interface CreateProductDialogProps {
    ideaId: string
    ideaTitle: string
    spaceId?: string
    trigger?: React.ReactNode
}

export function CreateProductDialog({
    ideaId,
    ideaTitle,
    spaceId,
    trigger
}: CreateProductDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: ideaTitle || "",
        archetype: "non_fiction",
        target_audience: "",
        style_family: "classic_publisher"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.target_audience.trim()) {
            toast.error("Por favor completa todos los campos requeridos")
            return
        }

        setLoading(true)
        try {
            const payload = {
                ...formData,
                seed_text: `Producto generado desde la idea: ${ideaId}`,
                space_id: spaceId
            }

            const res = await api.post("/products/", payload)
            toast.success("Producto creado exitosamente")
            setOpen(false)

            // Redirect to publisher page
            router.push(`/publisher/${res.data.id}`)
        } catch (error) {
            console.error("Error creating product:", error)
            toast.error("Error al crear el producto")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Crear Producto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Crear Producto Editorial
                        </DialogTitle>
                        <DialogDescription>
                            Convierte esta idea en un producto editorial completo. La IA generará
                            un blueprint y borradores basándose en el contenido acumulado.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Título del Producto <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Guía Completa de..."
                                required
                            />
                        </div>

                        {/* Archetype */}
                        <div className="grid gap-2">
                            <Label htmlFor="archetype">Tipo de Producto</Label>
                            <Select
                                value={formData.archetype}
                                onValueChange={(value) => setFormData({ ...formData, archetype: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="non_fiction">No Ficción</SelectItem>
                                    <SelectItem value="course">Curso</SelectItem>
                                    <SelectItem value="guide">Guía</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="fiction">Ficción</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Target Audience */}
                        <div className="grid gap-2">
                            <Label htmlFor="audience">
                                Audiencia Objetivo <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="audience"
                                value={formData.target_audience}
                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                placeholder="Ej: Profesionales de marketing, Estudiantes..."
                                required
                            />
                        </div>

                        {/* Style Family */}
                        <div className="grid gap-2">
                            <Label htmlFor="style">Estilo</Label>
                            <Select
                                value={formData.style_family}
                                onValueChange={(value) => setFormData({ ...formData, style_family: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="classic_publisher">Editorial Clásico</SelectItem>
                                    <SelectItem value="modern_minimalist">Minimalista Moderno</SelectItem>
                                    <SelectItem value="academic">Académico</SelectItem>
                                    <SelectItem value="conversational">Conversacional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
