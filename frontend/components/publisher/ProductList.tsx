"use client"

import Link from "next/link"
import { Edit2, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Product } from "@/types"

interface ProductListProps {
    products: Product[]
    onDelete: (id: string) => void
}

export function ProductList({ products, onDelete }: ProductListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Arquetipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[150px]">Creado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No hay productos en este espacio.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/publisher/${product.id}`} className="hover:underline">
                                        {product.title}
                                    </Link>
                                </TableCell>
                                <TableCell className="capitalize">{product.archetype.replace("_", " ")}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {product.status || 'Borrador'}
                                    </span>
                                </TableCell>
                                <TableCell>{product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Link href={`/publisher/${product.id}`}>
                                        <Button variant="ghost" size="icon" title="Editar en Estudio">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(product.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
