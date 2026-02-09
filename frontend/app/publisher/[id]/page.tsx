"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, LayoutTemplate, Printer } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BlueprintViewer } from "@/components/publisher/BlueprintViewer"
import { DraftEditor } from "@/components/publisher/DraftEditor"
import { api } from "@/services/api"
import { Product, ProductSection } from "@/types"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ProductStudioPage() {
    const params = useParams()
    const id = params?.id as string

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [sections, setSections] = useState<ProductSection[]>([])
    const [selectedSection, setSelectedSection] = useState<ProductSection | null>(null)
    const [previewHtml, setPreviewHtml] = useState("")

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const res = await api.get<Product>(`/products/${id}`)
                setProduct(res.data)
                // Flatten sections if they come nested, or just use as is. 
                // Assuming backend returns a tree or we need to build it.
                // For now assuming product has sections property.
                if (res.data.sections) {
                    setSections(res.data.sections)
                }
            } catch (error) {
                console.error("Error loading product", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const handleGenerateBlueprint = async () => {
        if (!product) return
        try {
            const res = await api.post(`/products/${product.id}/blueprint`)
            // Assuming res.data returns the list of root sections
            setSections(res.data)
            toast.success("Blueprint generado exitosamente")
        } catch (e) {
            console.error(e)
            toast.error("Error generando blueprint")
        }
    }

    const handleGenerateDraft = async (sectionId: string) => {
        if (!product) return
        try {
            // Mocking the drafts endpoint if it doesn't exist explicitly yet based on plan
            // Or assume POST /draft/section exists
            // Using the path from plan: POST /products/{id}/section/{section_id}/draft
            // If backend doesn't support this yet, we might get 404, detailed implementation dependent.
            // For now, let's assume we call specific endpoint.
            await api.post(`/products/${product.id}/sections/${sectionId}/draft`)

            // Refresh product to get new content 
            const res = await api.get<Product>(`/products/${product.id}`)
            if (res.data.sections) setSections(res.data.sections)

            // Also update selected section reference
            if (selectedSection && selectedSection.id === sectionId) {
                // Find updated section logic would be needed here (recursive find)
                toast.success("Borrador generado. Recarga para ver contenido.")
            }
        } catch (e) {
            console.error(e)
            toast.error("Error generando borrador. Verifica la conexión.")
        }
    }

    const handleSaveDraft = async (sectionId: string, content: string) => {
        // Implement save logic (Update section)
        // Likely PATCH /products/{id}/sections/{sectionId}
        console.log("Saving", sectionId, content)
        // Optimistic update
        const updateSections = (list: ProductSection[]): ProductSection[] => {
            return list.map(s => {
                if (s.id === sectionId) return { ...s, content }
                if (s.children) return { ...s, children: updateSections(s.children) }
                return s
            })
        }
        setSections(prev => updateSections(prev))
    }

    const loadPreview = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/products/${id}/preview`)
            setPreviewHtml(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <div className="p-10 text-center">Cargando Estudio...</div>
    if (!product) return <div className="p-10 text-center text-red-500">Producto no encontrado</div>

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Navbar */}
            <header className="flex items-center justify-between border-b pb-4 mb-4 flex-none">
                <div className="flex items-center gap-4">
                    <Link href="/publisher">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {product.title}
                            <Badge variant="outline" className="text-xs font-normal">
                                {product.archetype}
                            </Badge>
                        </h1>
                        <p className="text-xs text-muted-foreground break-all">ID: {product.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleGenerateBlueprint} disabled={sections.length > 0}>
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        {sections.length > 0 ? "Regenerar Blueprint" : "Generar Blueprint"}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Printer className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}/export?format=md`, '_blank')}>
                                Markdown (.md)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}/export?format=html`, '_blank')}>
                                HTML (.html)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* Left: Blueprint */}
                <div className="col-span-3 border-r pr-4 overflow-y-auto">
                    <div className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Estructura
                    </div>
                    <BlueprintViewer
                        sections={sections}
                        onSelectSection={setSelectedSection}
                        onGenerateDraft={handleGenerateDraft}
                        selectedSectionId={selectedSection?.id}
                    />
                </div>

                {/* Center/Right: Editor & Preview */}
                <div className="col-span-9 h-full">
                    <Tabs defaultValue="editor" className="h-full flex flex-col">
                        <TabsList>
                            <TabsTrigger value="editor">Editor</TabsTrigger>
                            <TabsTrigger value="preview" onClick={loadPreview}>Vista Previa</TabsTrigger>
                        </TabsList>

                        <TabsContent value="editor" className="flex-1 min-h-0 border rounded-md p-4 mt-2">
                            <DraftEditor
                                section={selectedSection}
                                onSave={handleSaveDraft}
                            />
                        </TabsContent>

                        <TabsContent value="preview" className="flex-1 min-h-0 border rounded-md p-0 mt-2 overflow-hidden bg-white">
                            {previewHtml ? (
                                <iframe
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-0"
                                    title="Preview"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    Cargando vista previa...
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
