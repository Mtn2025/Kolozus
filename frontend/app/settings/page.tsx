import { AIStrategySelector } from "@/components/settings/AIStrategySelector"
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>

            <section className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Apariencia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Tema del Sistema</span>
                            <ThemeSwitcher />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <AIStrategySelector />
            </section>
        </div>
    )
}
