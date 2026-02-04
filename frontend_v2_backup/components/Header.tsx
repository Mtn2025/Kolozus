"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import SearchButton from "@/components/SearchButton";
import SpaceSelector from "@/components/SpaceSelector";

export default function Header() {
    const { t } = useLanguage();
    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center mr-6">
                            <span className="font-bold text-xl tracking-tight text-primary mr-4">KOLOZUS</span>
                            <SpaceSelector />
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className="border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t("Dashboard")}
                            </Link>
                            <Link href="/library" className="border-transparent text-foreground/70 hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t("Library")}
                            </Link>
                            <Link href="/ingest" className="border-transparent text-foreground/70 hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t("Ingest")}
                            </Link>
                            <Link href="/products" className="border-transparent text-foreground/70 hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                {t("Publisher")}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                        <SearchButton />

                        <div className="flex-shrink-0">
                            <Link href="/audit" className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-foreground/70 bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <span>{t("System Audit")}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
