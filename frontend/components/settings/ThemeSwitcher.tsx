"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"



export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    // Import theme definitions
    const { themes: themeVars } = require("@/lib/themes")

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Inject CSS variables when theme changes
    React.useEffect(() => {
        if (!theme || !themeVars[theme]) return;

        const variables = themeVars[theme];
        const root = document.documentElement;

        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value as string);
        });

        // Handle font separately if needed, or included in vars
        if (variables["--font-sans"]) {
            root.style.fontFamily = variables["--font-sans"] as string;
        }

    }, [theme, themeVars]);

    if (!mounted) {
        return <Button variant="ghost" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>
    }

    const availableThemes = [
        { name: "Zinc Editorial", id: "zinc-editorial", color: "bg-zinc-400" },
        { name: "Slate Pro", id: "slate-pro", color: "bg-slate-400" },
        { name: "Stone Business", id: "stone-business", color: "bg-stone-400" },
        { name: "Midnight (Dark)", id: "midnight", color: "bg-blue-900" },
        { name: "Carbon (Dark)", id: "carbon", color: "bg-neutral-900" },
        { name: "Ivory (Light)", id: "ivory", color: "bg-yellow-100" },
    ]

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted-foreground hover:text-foreground"
                title="Change Theme"
            >
                <Palette className="h-5 w-5" />
            </Button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md border bg-popover p-2 shadow-md z-50">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Select Theme</div>
                    <div className="grid gap-1">
                        {availableThemes.map((t) => (
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
