"use client"

import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SettingsPage() {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("settingsTitle")}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("appearance")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{t("theme")}</p>
                            <p className="text-sm text-muted-foreground">{t("systemTheme")}</p>
                        </div>
                        <ThemeSwitch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{t("language")}</p>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
