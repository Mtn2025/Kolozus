"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 lg:hidden">
            <span className="text-lg font-bold">KOLOZUS</span>
            <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
            </Button>
        </header>
    )
}
