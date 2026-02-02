"use client";

import { SpaceProvider } from "@/app/lib/SpaceContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="evo"
            enableSystem={false}
            disableTransitionOnChange
        >
            <SpaceProvider>
                {children}
            </SpaceProvider>
        </NextThemesProvider>
    );
}
