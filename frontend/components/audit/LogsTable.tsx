"use client"

import { AuditLog } from "@/types/audit"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface LogsTableProps {
    logs: AuditLog[]
    loading: boolean
}

export function LogsTable({ logs, loading }: LogsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Hora</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Fragmento</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead className="text-right">Confianza</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">Cargando logs...</TableCell>
                        </TableRow>
                    ) : logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No hay actividad reciente.</TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getActionColor(log.action)}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs truncate max-w-[150px]" title={log.fragment_id}>
                                    {log.fragment_id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    {log.target_idea_id ? log.target_idea_id.substring(0, 8) + "..." : "-"}
                                </TableCell>
                                <TableCell className="text-right text-xs">
                                    {log.confidence ? (log.confidence * 100).toFixed(1) + "%" : "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function getActionColor(action: string) {
    switch (action) {
        case "CREATE_IDEA": return "border-green-500 text-green-500"
        case "ATTACH": return "border-blue-500 text-blue-500"
        case "DISCARD": return "border-red-500 text-red-500"
        default: return "border-gray-500"
    }
}
