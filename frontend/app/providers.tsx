"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { LanguageProvider } from "@/contexts/LanguageContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={[
                "light",
                "dark",
                "bloomberg",
                "onyx",
                "obsidian",
                "illuminate",
                "rose",
                "canvas",
                "zen"
            ]}
        >
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </NextThemesProvider>
    )
}
