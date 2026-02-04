"use client"

import { Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Space } from "@/types"

interface SpaceListProps {
    spaces: Space[]
    onDelete: (id: string) => void
    loading?: boolean
}

export function SpaceList({ spaces, onDelete }: SpaceListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-[100px]">Creado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {spaces.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No hay espacios creados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        spaces.map((space) => (
                            <TableRow key={space.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/spaces/${space.id}`} className="hover:underline flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary/20" />
                                        {space.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{space.description || "-"}</TableCell>
                                <TableCell>{new Date(space.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Link href={`/spaces/${space.id}`}>
                                        <Button variant="ghost" size="icon" title="Ver Detalle">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(space.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Eliminar Espacio"
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
