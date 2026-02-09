"use client"

import { useState, useEffect } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/services/api"
import { Space } from "@/types"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

interface IngestFormProps {
    onSuccess: (data: any) => void
}

export function IngestForm({ onSuccess }: IngestFormProps) {
    const { language, t } = useLanguage()
    const searchParams = useSearchParams()
    const defaultSpaceId = searchParams.get("space_id")

    const [loading, setLoading] = useState(false)
    const [spaces, setSpaces] = useState<Space[]>([])
    const [text, setText] = useState("")
    const [spaceId, setSpaceId] = useState<string>(defaultSpaceId || "")
    const [isBatch, setIsBatch] = useState(false)
    const [mode, setMode] = useState("default")
    const [model, setModel] = useState("gpt-4o") // Default high-end model

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const res = await api.get<Space[]>("/spaces/")
                setSpaces(res.data)
            } catch (e) {
                console.error(e)
            }
        }
        fetchSpaces()
    }, [])

    useEffect(() => {
        if (defaultSpaceId) setSpaceId(defaultSpaceId)
    }, [defaultSpaceId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !spaceId) return

        setLoading(true)
        try {
            let response
            const payload = {
                [isBatch ? "texts" : "text"]: isBatch
                    ? text.split(/\n\n+/).filter(t => t.trim().length > 0)
                    : text,
                space_id: spaceId,
                space_id: spaceId,
                mode: mode,
                model_name: model,
                language: language // Pass current language to backend
            }

            const endpoint = isBatch ? "/ingest/batch" : "/ingest/"
            response = await api.post(endpoint, payload, {
                headers: {
                    'Accept-Language': language // Backend can use this for LLM prompts
                }
            })

            onSuccess(response.data)
            setText("")
            toast.success(t("ingestSuccessMessage"))
        } catch (error) {
            console.error("Ingest failed", error)
            toast.error(t("ingestErrorMessage"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t("ingestCardTitle")}</CardTitle>
                <CardDescription>
                    {t("ingestCardDescription")}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Space Selection */}
                    <div className="space-y-2">
                        <Label>{t("destinationSpace")}</Label>
                        <Select value={spaceId} onValueChange={setSpaceId} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t("selectSpacePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {spaces.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Strategy (Mode) Selection */}
                        <div className="space-y-2">
                            <Label>{t("ingestStrategy") || "Estrategia"}</Label>
                            <Select value={mode} onValueChange={setMode}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Automática (Default)</SelectItem>
                                    <SelectItem value="explorer">Exploración (Guided)</SelectItem>
                                    <SelectItem value="consolidator">Consolidación (Flux)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <Label>{t("ingestModel") || "Modelo IA"}</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                    <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                                    <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Mode & Batch Toggles */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t("batchMode")}</Label>
                            <div className="text-xs text-muted-foreground">
                                {t("batchModeHelp")}
                            </div>
                        </div>
                        <Switch checked={isBatch} onCheckedChange={setIsBatch} />
                    </div>

                    {/* Text Area */}
                    <div className="space-y-2">
                        <Label>{t("contentLabel")}</Label>
                        <Textarea
                            placeholder={t("contentPlaceholder")}
                            className="min-h-[200px] font-mono text-sm"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {text.length} {t("charactersLabel")}
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button type="submit" disabled={loading || !spaceId || !text.trim()}>
                        {loading ? (
                            <>{t("processing")}</>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {t("ingestButtonLabel")} {isBatch ? t("batchLabel") : ""}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
