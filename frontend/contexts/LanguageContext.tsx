"use client"

import * as React from "react"

type Language = "es" | "en"

interface Translations {
    [key: string]: string
}

const translations: Record<Language, Translations> = {
    es: {
        // Navigation
        dashboard: "Tablero",
        library: "Mi Biblioteca",
        ingest: "Ingesta",
        editorial: "Editorial",
        audit: "Auditoría",
        settings: "Configuración",

        // Dashboard Page
        appTitle: "Kolozus v3",
        frontendRebootMessage: "Frontend reiniciado correctamente.",
        systemReady: "Sistema Listo",
        uiConfigured: "Tailwind + Shadcn/UI Configurado.",

        // Library Page
        libraryTitle: "Biblioteca Cognitiva",
        librarySubtitle: "Explora tu red de conocimiento.",
        searchingConnections: "Buscando conexiones semánticas...",
        semanticSearchHelp: "La búsqueda semántica encontrará ideas relacionadas conceptualmente.",
        searchError: "Error de búsqueda",
        knowledgeGraph: "Grafo de Conocimiento",
        searchPlaceholder: "Busca ideas, fragmentos o conceptos...",
        ingestText: "Ingestar Texto",
        loadingGraph: "Cargando Grafo...",

        // Ingest Page
        ingestTitle: "Ingesta",
        ingestSubtitle: "Alimenta tu sistema con nueva información.",
        loadingForm: "Cargando formulario...",
        ingestCardTitle: "Ingesta de Conocimiento",
        ingestCardDescription: "Transforma texto crudo en fragmentos cognitivos e ideas conectadas.",
        destinationSpace: "Espacio de Destino",
        selectSpacePlaceholder: "Selecciona un espacio...",
        batchMode: "Modo por Lotes",
        batchModeHelp: "Separa por doble salto de línea (\\n\\n)",
        contentLabel: "Contenido",
        contentPlaceholder: "Pega aquí tu texto, notas o extractos...",
        charactersLabel: "caracteres",
        processing: "Procesando...",
        ingestButtonLabel: "Ingestar",
        batchLabel: "(Batch)",
        ingestSuccessMessage: "Ingesta completada correctamente",
        ingestErrorMessage: "Error al ingerir texto. Revisa la consola.",

        // Publisher/Editorial Page
        publisherTitle: "Estudio Editorial",
        publisherSubtitle: "Convierte tu conocimiento en productos terminados.",
        filterBySpace: "Filtrar por Espacio:",
        loadingProducts: "Cargando productos...",
        deleteProductConfirm: "¿Eliminar producto?",
        myProducts: "Mis Productos",
        createProduct: "Crear Producto",
        productTitle: "Título del Producto",
        archetype: "Arquetipo",
        styleFamily: "Familia de Estilo",

        // Audit Page
        auditTitle: "Observabilidad Cognitiva",
        auditSubtitle: "Monitorización en tiempo real del motor de decisión.",
        updatedLabel: "Actualizado:",
        rulesEngine: "Motor de Reglas v2.1",
        decisionFeed: "Feed de Decisiones",
        exportCSV: "Exportar CSV",

        // Settings Page
        settingsTitle: "Configuración",
        appearance: "Apariencia",
        systemTheme: "Tema del Sistema",
        theme: "Tema",
        language: "Idioma",

        // Spaces Page
        spacesTitle: "Espacios de Conocimiento",
        spacesSubtitle: "Gestiona tus áreas de investigación y curación.",
        loadingSpaces: "Cargando espacios...",
        deleteSpaceConfirm: "¿Estás seguro de eliminar este espacio? Esta acción no se puede deshacer.",

        // Common UI
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        create: "Crear",
        search: "Buscar",
        loading: "Cargando...",
        confirm: "Confirmar",
        close: "Cerrar",
        open: "Abrir",
        upload: "Subir",
        download: "Descargar",
        error: "Error",
        success: "Éxito",
        areYouSure: "¿Estás seguro?",

        // Product archetypes
        non_fiction: "No Ficción",
        fiction: "Ficción",
        course: "Curso",

        // Style families
        classic_publisher: "Editorial Clásica",
        modern_minimalist: "Minimalista Moderna",
    },
    en: {
        // Navigation
        dashboard: "Dashboard",
        library: "My Library",
        ingest: "Ingest",
        editorial: "Editorial",
        audit: "Audit",
        settings: "Settings",

        // Dashboard Page
        appTitle: "Kolozus v3",
        frontendRebootMessage: "Frontend rebooted successfully.",
        systemReady: "System Ready",
        uiConfigured: "Tailwind + Shadcn/UI Configured.",

        // Library Page
        libraryTitle: "Cognitive Library",
        librarySubtitle: "Explore your knowledge network.",
        searchingConnections: "Searching semantic connections...",
        semanticSearchHelp: "Semantic search will find conceptually related ideas.",
        searchError: "Search error",
        knowledgeGraph: "Knowledge Graph",
        searchPlaceholder: "Search ideas, fragments or concepts...",
        ingestText: "Ingest Text",
        loadingGraph: "Loading Graph...",

        // Ingest Page
        ingestTitle: "Ingest",
        ingestSubtitle: "Feed your system with new information.",
        loadingForm: "Loading form...",
        ingestCardTitle: "Knowledge Ingestion",
        ingestCardDescription: "Transform raw text into cognitive fragments and connected ideas.",
        destinationSpace: "Destination Space",
        selectSpacePlaceholder: "Select a space...",
        batchMode: "Batch Mode",
        batchModeHelp: "Separate by double line break (\\n\\n)",
        contentLabel: "Content",
        contentPlaceholder: "Paste your text, notes or excerpts here...",
        charactersLabel: "characters",
        processing: "Processing...",
        ingestButtonLabel: "Ingest",
        batchLabel: "(Batch)",
        ingestSuccessMessage: "Ingestion completed successfully",
        ingestErrorMessage: "Error ingesting text. Check console.",

        // Publisher/Editorial Page
        publisherTitle: "Editorial Studio",
        publisherSubtitle: "Turn your knowledge into finished products.",
        filterBySpace: "Filter by Space:",
        loadingProducts: "Loading products...",
        deleteProductConfirm: "Delete product?",
        myProducts: "My Products",
        createProduct: "Create Product",
        productTitle: "Product Title",
        archetype: "Archetype",
        styleFamily: "Style Family",

        // Audit Page
        auditTitle: "Cognitive Observability",
        auditSubtitle: "Real-time monitoring of the decision engine.",
        updatedLabel: "Updated:",
        rulesEngine: "Rules Engine v2.1",
        decisionFeed: "Decision Feed",
        exportCSV: "Export CSV",

        // Settings Page
        settingsTitle: "Settings",
        appearance: "Appearance",
        systemTheme: "System Theme",
        theme: "Theme",
        language: "Language",

        // Spaces Page
        spacesTitle: "Knowledge Spaces",
        spacesSubtitle: "Manage your research and curation areas.",
        loadingSpaces: "Loading spaces...",
        deleteSpaceConfirm: "Are you sure you want to delete this space? This action cannot be undone.",

        // Common UI
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        search: "Search",
        loading: "Loading...",
        confirm: "Confirm",
        close: "Close",
        open: "Open",
        upload: "Upload",
        download: "Download",
        error: "Error",
        success: "Success",
        areYouSure: "Are you sure?",

        // Product archetypes
        non_fiction: "Non Fiction",
        fiction: "Fiction",
        course: "Course",

        // Style families
        classic_publisher: "Classic Publisher",
        modern_minimalist: "Modern Minimalist",
    }
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Auto-detect language helper
    const detectLanguage = (): Language => {
        if (typeof window === 'undefined') return 'es'

        // 1. Check localStorage (user preference)
        const saved = localStorage.getItem('language')
        if (saved && ['es', 'en'].includes(saved)) {
            return saved as Language
        }

        // 2. Check browser language
        const browserLang = navigator.language.split('-')[0]
        if (['es', 'en'].includes(browserLang)) {
            return browserLang as Language
        }

        // 3. Default to Spanish
        return 'es'
    }

    const [language, setLanguageState] = React.useState<Language>('es')
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        // Auto-detect on mount
        const detected = detectLanguage()
        setLanguageState(detected)
        setMounted(true)
    }, [])

    const setLanguage = React.useCallback((lang: Language) => {
        setLanguageState(lang)
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang)

            // Persist to backend
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/ui/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: lang })
            }).catch(err => console.error('Failed to persist language:', err))

            // Dispatch custom event for components that need to react
            window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
        }
    }, [])

    const t = React.useCallback((key: string): string => {
        return translations[language]?.[key] || key
    }, [language])

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = React.useContext(LanguageContext)

    // If outside provider (e.g., error pages), return safe defaults
    if (!context) {
        return {
            language: 'es' as Language,
            setLanguage: () => { },
            t: (key: string) => key
        }
    }

    return context
}
