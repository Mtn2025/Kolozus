"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, UploadCloud, Library, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher"

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Tablero" },
    { href: "/library", icon: Library, label: "Mi Biblioteca" },
    { href: "/ingest", icon: UploadCloud, label: "Ingesta" },
    { href: "/publisher", icon: BookOpen, label: "Editorial" },
    { href: "/audit", icon: ShieldAlert, label: "Auditoría" },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("flex flex-col h-full border-r bg-card text-card-foreground", className)}>
            {/* Logo Area */}
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold tracking-tight text-primary">KOLOZUS<span className="text-xs ml-1 font-normal opacity-70">v3</span></span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
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

            {/* Footer / Settings */}
            <div className="border-t p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Configuración</span>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}
