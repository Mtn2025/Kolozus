"use client"

import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Cpu, Zap, Shield } from "lucide-react"
import { toast } from "sonner" // Assuming sonner or useToast is available, if not I'll standard alert or console

interface AIProfile {
    name: string
    blueprinter: { provider: string, model_name: string }
    drafter: { provider: string, model_name: string }
    summarizer: { provider: string, model_name: string }
    embedding: { provider: string, model_name: string }
}

const STRATEGIES = [
    {
        id: "maestro",
        title: "The Heavyweight (Maestro)",
        description: "Máxima calidad y razonamiento complejo.",
        icon: Cpu,
        details: "Groq Llama 3.3 70B (~$0.60/1M)",
        color: "border-blue-500 bg-blue-50/10"
    },
    {
        id: "spark",
        title: "The Speedster (Spark)",
        description: "Velocidad extrema para tareas simples.",
        icon: Zap,
        details: "Groq Llama 3.1 8B (~$0.05/1M)",
        color: "border-yellow-500 bg-yellow-50/10"
    },
    {
        id: "guardian",
        title: "The Sovereign (Guardian)",
        description: "Privacidad total y costo cero. Ejecución local.",
        icon: Shield,
        details: "Ollama Local (DeepSeek R1 + Llama 3.3)",
        color: "border-green-500 bg-green-50/10"
    }
]

export function AIStrategySelector() {
    const [currentProfile, setCurrentProfile] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await api.get<AIProfile>("/api/ai/config")
            setCurrentProfile(res.data.name)
        } catch (error) {
            console.error("Error fetching AI config", error)
        }
    }

    const handleSelect = async (profileId: string) => {
        setLoading(true)
        try {
            await api.post("/api/ai/config", { profile_name: profileId })
            setCurrentProfile(profileId)
        } catch (error) {
            console.error("Error updating profile", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Estrategia de Inteligencia Artificial</h3>
                <p className="text-sm text-muted-foreground">
                    Selecciona el motor cognitivo que impulsará a Kolozus.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STRATEGIES.map((strategy) => {
                    const Icon = strategy.icon
                    const isSelected = currentProfile === strategy.id

                    return (
                        <Card
                            key={strategy.id}
                            className={`cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${isSelected ? `ring-2 ring-primary ${strategy.color}` : 'opacity-80 hover:opacity-100'}`}
                            onClick={() => handleSelect(strategy.id)}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                            <CardHeader>
                                <Icon className="w-8 h-8 mb-2" />
                                <CardTitle className="text-base">{strategy.title}</CardTitle>
                                <CardDescription>{strategy.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs font-mono bg-muted p-2 rounded">
                                    {strategy.details}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
