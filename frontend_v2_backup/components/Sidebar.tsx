"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import SpaceSelector from "@/components/SpaceSelector";
import SearchButton from "@/components/SearchButton";

export default function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform overflow-y-auto hidden md:flex flex-col">
            {/* Logo Area */}
            <div className="flex items-center h-16 px-6 border-b border-border">
                <span className="font-bold text-xl tracking-tight text-primary">KOLOZUS</span>
            </div>

            {/* Space Selector Area */}
            <div className="p-4">
                <SpaceSelector />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <Link
                    href="/"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/") && pathname === "/" // Exact match for home 
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <span className="mr-3">📊</span>
                    {t("Dashboard")}
                </Link>

                <Link
                    href="/library"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/library")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <span className="mr-3">📚</span>
                    {t("Library")}
                </Link>

                <Link
                    href="/ingest"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/ingest")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <span className="mr-3">📥</span>
                    {t("Ingest")}
                </Link>

                <Link
                    href="/products"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/products")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <span className="mr-3">✍️</span>
                    {t("Publisher")}
                </Link>

                <div className="pt-4 mt-4 border-t border-border">
                    <Link
                        href="/audit"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/audit")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        <span className="mr-3">🧠</span>
                        {t("System Audit")}
                    </Link>
                </div>
            </nav>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                <SearchButton />
            </div>
        </aside>
    );
}
