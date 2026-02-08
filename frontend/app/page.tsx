"use client"

import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("appTitle")}</h1>
        <p className="text-muted-foreground">{t("frontendRebootMessage")}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold">{t("systemReady")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("uiConfigured")}
        </p>
      </Card>
    </div>
  )
}
