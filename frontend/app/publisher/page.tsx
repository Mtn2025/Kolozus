"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { Space, Product } from "@/types"
import { CreateProductDialog } from "@/components/publisher/CreateProductDialog"
import { ProductList } from "@/components/publisher/ProductList"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PublisherPage() {
    const [spaces, setSpaces] = useState<Space[]>([])
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>("")
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch Spaces on load
    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const res = await api.get<Space[]>("/spaces/")
                setSpaces(res.data)
                if (res.data.length > 0) {
                    setSelectedSpaceId(res.data[0].id)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchSpaces()
    }, [])

    // Fetch Products when space changes
    const fetchProducts = async () => {
        if (!selectedSpaceId) return
        setLoading(true)
        try {
            const res = await api.get<Product[]>("/products/", {
                params: { space_id: selectedSpaceId }
            })
            setProducts(res.data)
        } catch (error) {
            console.error("Error fetching products", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [selectedSpaceId])

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar producto?")) return
        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Estudio Editorial</h2>
                    <p className="text-muted-foreground">Convierte tu conocimiento en productos terminados.</p>
                </div>
                <CreateProductDialog onProductCreated={fetchProducts} />
            </div>

            <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg">
                <span className="text-sm font-medium">Filtrar por Espacio:</span>
                <div className="w-[300px]">
                    <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un espacio..." />
                        </SelectTrigger>
                        <SelectContent>
                            {spaces.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="animate-pulse">Cargando productos...</span>
                </div>
            ) : (
                <ProductList products={products} onDelete={handleDelete} />
            )}
        </div>
    )
}
