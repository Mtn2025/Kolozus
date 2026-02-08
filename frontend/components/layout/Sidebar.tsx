"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, UploadCloud, Library, ShieldAlert } from "lucide-react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher"
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/services/api"
import { Trash2, Settings, Plus } from "lucide-react"

// Import Components
import { CreateSpaceDialog } from "@/components/spaces/CreateSpaceDialog"
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

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { t } = useLanguage()

    // Navigation items with translations
    const navItems = [
        { href: "/", icon: LayoutDashboard, label: t("dashboard") },
        { href: "/library", icon: Library, label: t("library") },
        { href: "/ingest", icon: UploadCloud, label: t("ingest") },
        { href: "/publisher", icon: BookOpen, label: t("editorial") },
        { href: "/audit", icon: ShieldAlert, label: t("audit") },
    ]
    // Spaces State
    const [spaces, setSpaces] = useState<{ id: string, name: string }[]>([])
    const [loadingSpaces, setLoadingSpaces] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Delete confirmation
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [spaceToDelete, setSpaceToDelete] = useState<{ id: string, name: string } | null>(null)

    // Fetch Spaces
    useEffect(() => {
        const fetchSpaces = async () => {
            setLoadingSpaces(true)
            try {
                // Assuming Type Space matches what we need, simplified here
                const res = await api.get<any[]>("/spaces/")
                setSpaces(res.data)
            } catch (error) {
                console.error("Error loading spaces", error)
            } finally {
                setLoadingSpaces(false)
            }
        }
        fetchSpaces()
    }, [refreshTrigger])

    const handleDeleteSpace = async () => {
        if (!spaceToDelete) return
        try {
            await api.delete(`/spaces/${spaceToDelete.id}`)
            setSpaces(spaces.filter(s => s.id !== spaceToDelete.id))
            setDeleteOpen(false)
            setSpaceToDelete(null)
            // toast.success("Espacio eliminado") 
        } catch (error) {
            console.error("Error deleting space", error)
        }
    }

    return (
        <div className={cn("flex flex-col h-full border-r bg-card text-card-foreground", className)}>
            {/* Logo Area */}
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold tracking-tight text-primary">KOLOZUS<span className="text-xs ml-1 font-normal opacity-70">v3</span></span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                {/* Main Nav */}
                <nav>
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Spaces Section */}
                <div className="px-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Espacios
                        </h3>
                        <CreateSpaceDialog onSpaceCreated={() => setRefreshTrigger(prev => prev + 1)} />
                    </div>

                    {loadingSpaces ? (
                        <div className="text-xs text-muted-foreground px-2">Cargando...</div>
                    ) : (
                        <ul className="space-y-1">
                            {spaces.map((space) => {
                                const isSpaceActive = pathname === `/spaces/${space.id}`
                                return (
                                    <li key={space.id} className="group relative">
                                        <Link
                                            href={`/spaces/${space.id}`}
                                            className={cn(
                                                "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                                isSpaceActive
                                                    ? "bg-accent text-accent-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                                <span className="truncate">{space.name}</span>
                                            </div>
                                        </Link>

                                        {/* Delete Action (visible on hover) */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSpaceToDelete(space)
                                                setDeleteOpen(true)
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                                            title="Eliminar Espacio"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Footer / Settings */}
            <div className="border-t p-4 flex items-center justify-between bg-card">
                <Link href="/settings" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    {t("settings")}
                </Link>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el espacio "{spaceToDelete?.name}" y todo su contenido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSpaceToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSpace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
