"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"

const themes = [
    { name: "Evo Enterprise", id: "light", color: "bg-slate-200" },
    { name: "Evo Dark", id: "dark", color: "bg-slate-900" },
    { name: "Bloomberg", id: "bloomberg", color: "bg-orange-500" },
    { name: "Onyx Glass", id: "onyx", color: "bg-purple-600" },
    { name: "Obsidian", id: "obsidian", color: "bg-yellow-500" },
    { name: "Illuminate", id: "illuminate", color: "bg-white border-black" },
    { name: "Rose Stone", id: "rose", color: "bg-rose-400" },
    { name: "Canvas", id: "canvas", color: "bg-amber-100" },
    { name: "Zen Garden", id: "zen", color: "bg-green-700" },
]

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="ghost" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>
    }

    // Simple dropdown/grid for now, can be improved to Popover later
    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted-foreground hover:text-foreground"
            >
                <Palette className="h-5 w-5" />
            </Button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md border bg-popover p-2 shadow-md z-50">
                    <div className="grid gap-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id)
                                    setIsOpen(false)
                                }}
                                className={`flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${theme === t.id ? 'bg-accent font-medium' : ''}`}
                            >
                                <span className={`w-3 h-3 rounded-full mr-2 ${t.color} border`} />
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
