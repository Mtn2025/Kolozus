"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem("kolozus_language");
        if (saved && (saved === "en" || saved === "es")) {
            setLanguageState(saved as Language);
        } else {
            // Default to spanish if browser suggests it? No, keeping strict default 'en' for now unless requested.
            // Actually user requested spanish activation.
            // Let's check browser lang but default 'en' usually safest for tech products unless specified.
            // User said "activate spanish". Let's default to ES if nothing saved?
            // "activa español" implies default might want to be Spanish.
            // Let's stick to 'en' default but make it easy to switch.
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("kolozus_language", lang);
    };

    // Simple translation dictionary
    const dictionary: Record<string, Record<string, string>> = {
        "en": {
            "Dashboard": "Dashboard",
            "Library": "Library",
            "Ingest": "Ingest",
            "Publisher": "Publisher",
            "System Audit": "System Audit",
            "Search...": "Search...",
            "Knowledge Overview": "Knowledge Overview",
            "Real-time insight into cognitive fragments and evolutionary states.": "Real-time insight into cognitive fragments and evolutionary states.",
            "Inject Knowledge": "Inject Knowledge",
            "Total Fragments": "Total Fragments",
            "In Exploration": "In Exploration",
            "Germinal State": "Germinal State",
            "Active Entities": "Active Entities",
            "View all entities": "View all entities",
            "Mass Ingestion": "Mass Ingestion",
            "Paste bulk text or logs. Double newlines act as delimiters.": "Paste bulk text or logs. Double newlines act as delimiters.",
            "Target Space": "Target Space",
            "Processing Batch...": "Processing Batch...",
            "Process Batch": "Process Batch",
            "Delete Space": "Delete Space",
            "Are you sure you want to delete space": "Are you sure you want to delete space",
            "Failed to delete space": "Failed to delete space",
            "Delete Product": "Delete Product",
            "Failed to delete product": "Failed to delete product",
            "Loading trash...": "Loading trash...",
            "Trash is empty.": "Trash is empty.",
            "Loading Studio...": "Loading Studio...",
            "all": "all",
            "germinal": "germinal",
            "exploration": "exploration",
            "consolidated": "consolidated",
            "Germinal": "Germinal",
            "Consolidated": "Consolidated",
            "System Neural Audit": "System Neural Audit",
            "Real-time telemetry of the cognitive architecture.": "Real-time telemetry of the cognitive architecture.",
            "Knowledge Vectors": "Knowledge Vectors",
            "Cognitive Entropy": "Cognitive Entropy",
            "Stability": "Stability",
            "Infrastructure Scale": "Infrastructure Scale",
            "Active Spaces": "Active Spaces",
            "Editorial Products": "Editorial Products",
            "Total Decisions Logged": "Total Decisions Logged",
            "System uptime: 99.9%. Last reboot: 26 mins ago.": "System uptime: 99.9%. Last reboot: 26 mins ago.",
            "Recent Activity": "Recent Activity",
            "Decision Ledger Stream": "Decision Ledger Stream",
            "Immutable record of all cognitive engine actions.": "Immutable record of all cognitive engine actions.",
            "Timestamp": "Timestamp",
            "Action": "Action",
            "Target ID": "Target ID",
            "Confidence": "Confidence",
            "Reasoning": "Reasoning",
            "No explicit reasoning recorded.": "No explicit reasoning recorded.",
            "No recent audit events found.": "No recent audit events found.",
            "Editorial Level:": "Editorial Level:",
            "Structure": "Structure",
            "This section is empty.": "This section is empty.",
            "Select a section to begin writing, or generate a structure.": "Select a section to begin writing, or generate a structure.",
            "Design Specifications": "Design Specifications",
            "Base Font": "Base Font",
            "Default (System UI)": "Default (System UI)",
            "Inter (Modern)": "Inter (Modern)",
            "Georgia (Classic)": "Georgia (Classic)",
            "Courier (Draft)": "Courier (Draft)",
            "Primary Color": "Primary Color",
            "Accent Color": "Accent Color",
            "Knowledge Library": "Knowledge Library",
            "Loading library...": "Loading library...",
            "Weight:": "Weight:",
            "Syncing with cortex...": "Syncing with cortex...",
            "Idea not found in memory.": "Idea not found in memory.",
            "Raw inputs that have been attached to this idea by the Cognitive Engine.": "Raw inputs that have been attached to this idea by the Cognitive Engine.",
            "No direct fragments linked (Genesis might differ).": "No direct fragments linked (Genesis might differ).",
            "Loading fragments...": "Loading fragments...",
            "Content Preview": "Content Preview",
            "Actions": "Actions",
            "Loading detail...": "Loading detail...",
            "Not found": "Not found",
            "Payload (Invariant)": "Payload (Invariant)",
            "Original text content injected into the system.": "Original text content injected into the system.",
            "Cognitive Audit Trace": "Cognitive Audit Trace",
            "No decisions recorded": "No decisions recorded",
            "This fragment may have been ingested before the audit ledger was active.": "This fragment may have been ingested before the audit ledger was active.",
            "Conf:": "Conf:",
            "Target Entity": "Target Entity",
            "Execution Metadata": "Execution Metadata",
            "ProTip:": "ProTip:",
            "Kolozus Semantic Search": "Kolozus Semantic Search"
        },

        "es": {
            "Dashboard": "Tablero",
            "Library": "Biblioteca",
            "Ingest": "Ingesta",
            "Publisher": "Publisher",
            "System Audit": "Auditoría del Sistema",
            "Search...": "Buscar...",
            "Knowledge Overview": "Resumen de Conocimiento",
            "Real-time insight into cognitive fragments and evolutionary states.": "Visión en tiempo real de fragmentos cognitivos y estados evolutivos.",
            "Inject Knowledge": "Inyectar Conocimiento",
            "Total Fragments": "Total de Fragmentos",
            "In Exploration": "En Exploración",
            "Germinal State": "Estado Germinal",
            "Active Entities": "Entidades Activas",
            "View all entities": "Ver todas las entidades",
            "Loading ecosystem...": "Cargando ecosistema...",
            "Untitled Idea": "Idea Sin Título",
            "Context: ": "Contexto: ",
            "Global": "Global",

            "Mass Ingestion": "Ingesta Masiva",
            "Paste bulk text or logs. Double newlines act as delimiters.": "Pegue texto masivo o logs. Doble salto de línea actúa como delimitador.",
            "Target Space": "Espacio Destino",
            "Processing Batch...": "Procesando Lote...",
            "Ingest Batch": "Ingerir Lote",
            "Batch Results": "Resultados del Lote",
            "Please select a Space first (top left corner).": "Seleccione un espacio primero (esquina superior izquierda).",
            "Batch ingestion failed": "Fallo en la ingestión por lotes",
            "Cognitive Mode": "Modo Cognitivo",
            "Balanced (Default)": "Equilibrado (Por defecto)",
            "Explorer (Create New)": "Explorador (Crear Nuevo)",
            "Consolidator (Link Existing)": "Consolidador (Vincular Existente)",
            "Paste your raw notes, logs, or brainstorming dump here...": "Pegue aquí sus notas, registros o lluvia de ideas...",

            "Publisher Studio": "Estudio Editorial",
            "Create expert-level content from your knowledge base.": "Cree contenido experto desde su base de conocimiento.",
            "Project Title": "Título del Proyecto",
            "e.g., 'The Future of AI'": "ej., 'El Futuro de la IA'",
            "Archetype": "Arquetipo",
            "Editorial": "Editorial",
            "Non-Fiction Book": "Libro de No Ficción",
            "Essay Anthology": "Antología de Ensayos",
            "Fiction / Novel": "Ficción / Novela",
            "Academic": "Académico",
            "Thesis / Dissertation": "Tesis / Disertación",
            "Scientific Paper": "Artículo Científico",
            "Textbook": "Libro de Texto",
            "Business": "Negocios",
            "White Paper": "Libro Blanco (White Paper)",
            "SOP Manual": "Manual de Procedimientos",
            "Case Study Collection": "Colección de Casos de Estudio",
            "Digital": "Digital",
            "Online Course": "Curso Online",
            "Blog Series": "Serie de Blog",
            "Newsletter Issue": "Edición de Newsletter",
            "Technical": "Técnico",
            "Technical Documentation": "Documentación Técnica",
            "Product Roadmap (PRD)": "Hoja de Ruta de Producto (PRD)",
            "Oral": "Oral",
            "Keynote Speech": "Discurso Keynote",
            "Design Style": "Estilo de Diseño",
            "Academic Rigor (Serif, Justified)": "Rigor Académico (Serif, Justificado)",
            "Modern Startup (Sans, Bold)": "Startup Moderna (Sans, Negrita)",
            "Classic Publisher (Garamond)": "Editorial Clásica (Garamond)",
            "Swiss Grid (Clean, Blocky)": "Rejilla Suiza (Limpio, Bloques)",
            "Screen Flow (Digital First)": "Flujo de Pantalla (Digital Primero)",
            "Creating Project...": "Creando Proyecto...",
            "Initialize Project": "Inicializar Proyecto",
            "No editorial projects yet in": "No hay proyectos editoriales aún en",
            "Updated": "Actualizado",
            "Failed to create product": "Error al crear producto",
            "Please select a Space to manage products.": "Seleccione un espacio para gestionar productos.",

            "Vector Indices": "Índices Vectoriales",
            "Cognitive Graph": "Grafo Cognitivo",
            "Ingestion Queue": "Cola de Ingesta",
            "System Health": "Salud del Sistema",
            "Mapped Concepts": "Conceptos Mapeados",
            "All Processed": "Todo Procesado",
            "Uptime": "Tiempo de Actividad",
            "Recent Vector Ingestion Logs": "Logs Recientes de Ingesta Vectorial",
            "Scanning logs...": "Escaneando logs...",
            "Timestamp": "Marca de Tiempo",
            "Source": "Fuente",

            "Status": "Estado",

            "Search knowledge...": "Buscar conocimiento...",
            "Thinking...": "Pensando...",
            "No matching ideas found.": "No se encontraron ideas coincidentes.",
            "Search for specific concepts, ideas or domains.": "Busque conceptos, ideas o dominios específicos.",
            "Use regular natural language.": "Use lenguaje natural regular.",

            "Select Space...": "Seleccionar Espacio...",
            "New Space": "Nuevo Espacio",
            "Space Name": "Nombre del Espacio",
            "Cancel": "Cancelar",
            "Create": "Crear",
            "Failed to create space": "Error al crear espacio",
            "What is this space for?": "¿Para qué es este espacio?",
            "e.g., Personal Knowledge": "ej., Conocimiento Personal",
            "Create Space": "Crear Espacio",
            "Creating...": "Creando...",

            "AI Infrastructure": "Infraestructura de IA",
            "Select the cognitive engine that powers Kolozus. Choose between Cloud Speed, Quality, or Local Privacy.": "Seleccione el motor cognitivo que impulsa Kolozus. Elija entre Velocidad en Nube, Calidad o Privacidad Local.",
            "Error": "Error",
            "Success": "Éxito",
            "Active profile switched to": "Perfil activo cambiado a",
            "Could not load settings": "No se pudo cargar la configuración",
            "Failed to save settings": "Error al guardar configuración",
            "Failed to update profile": "Error al actualizar perfil",
            "Technical Status": "Estado Técnico",
            "Groq Connection": "Conexión Groq",
            "Ollama Local": "Ollama Local",
            "Connected": "Conectado",
            "Checking...": "Comprobando...",
            "Active": "Activo",

            "Editorial Maestro": "Maestro Editorial",
            "Maximum quality and structure. Uses Groq Llama 3.3 70B. Ideal for professional publishing.": "Máxima calidad y estructura. Usa Groq Llama 3.3 70B. Ideal para publicaciones profesionales.",
            "Space Required": "Espacio Requerido",
            "New Project": "Nuevo Proyecto",
            "Initialize New Project": "Inicializar Nuevo Proyecto",
            "No editorial projects yet": "Aún no hay proyectos editoriales",
            "Create your first book, article, or paper.": "Crea tu primer libro, artículo o paper.",
            "Back": "Atrás",
            "Table of Contents": "Tabla de Contenidos",
            "Section Title": "Título de la Sección",
            "Add Section": "Añadir Sección",
            "Generate AI Draft": "Generar Borrador IA",
            "Start writing or generate a draft using your knowledge base...": "Empieza a escribir o genera un borrador usando tu base de conocimiento...",
            "Select a section from the sidebar to start editing.": "Selecciona una sección de la barra lateral para editar.",
            "Visual Blueprint": "Blueprint Visual",
            "Export": "Exportar",
            "Spark Writer": "Escritor Spark",
            "Rocket speed for brainstorming. Uses Groq Llama 3.1 8B. Instant generation.": "Velocidad cohete para lluvia de ideas. Usa Groq Llama 3.1 8B. Generación instantánea.",
            "Private Guardian": "Guardián Privado",
            "100% Local privacy. Uses Ollama (DeepSeek R1 + Llama 3.3). Requires powerful GPU.": "100% Privacidad Local. Usa Ollama (DeepSeek R1 + Llama 3.3). Requiere GPU potente.",
            "Custom Forge": "Forja Personalizada",
            "Advanced configuration. Manually select providers for each agent role.": "Configuración avanzada. Seleccione manualmente proveedores para cada rol de agente.",

            "Appearance": "Apariencia",
            "Customize the look and feel of your workspace. Changes are saved to your profile.": "Personalice la apariencia de su espacio de trabajo. Los cambios se guardan en su perfil.",
            "Saving...": "Guardando...",
            "All changes saved locally and to cloud.": "Cambios guardados localmente y en la nube.",
            "Could not save theme preference. It will reset on reload.": "No se pudo guardar la preferencia de tema.",

            "Evo Enterprise": "Empresarial Evo",
            "The standard for SaaS. Clean blue-slate palette.": "El estándar para SaaS. Paleta azul-pizarra limpia.",
            "Bloomberg Terminal": "Terminal Bloomberg",
            "Data-dense, high contrast teal and grey.": "Denso en datos, alto contraste verde azulado y gris.",
            "Onyx Glass": "Cristal Ónix",
            "Cyberpunk glassmorphism with neon accents.": "Glassmorfismo cyberpunk con acentos neón.",
            "Obsidian Gold": "Oro Obsidiana",
            "Matte black and muted gold. Serious elegance.": "Negro mate y oro apagado. Elegancia seria.",
            "Illuminate Studio": "Estudio Iluminado",
            "Stark black and white. Maximum contrast.": "Blanco y negro absoluto. Máximo contraste.",
            "Rose & Stone": "Rosa y Piedra",
            "Soft, warm, and welcoming. Editorial feel.": "Suave, cálido y acogedor. Toque editorial.",
            "Canvas Paper": "Papel Lienzo",
            "Warm paper background, serif type. No distractions.": "Fondo de papel cálido, tipografía serif. Sin distracciones.",
            "Zen Garden": "Jardín Zen",
            "Calming sage greens and nature tones.": "Verdes salvia calmantes y tonos naturales.",
            "Delete Space": "Eliminar Espacio",
            "Are you sure you want to delete space": "¿Está seguro de que desea eliminar el espacio",
            "Failed to delete space": "Error al eliminar espacio",
            "Delete Product": "Eliminar Producto",
            "Failed to delete product": "Error al eliminar producto",
            "Loading trash...": "Cargando papelera...",
            "Trash is empty.": "La papelera está vacía.",
            "Loading Studio...": "Cargando Estudio...",
            "all": "todos",
            "germinal": "germinal",
            "exploration": "exploración",
            "consolidated": "consolidado",
            "Germinal": "Germinal",
            "Consolidated": "Consolidado",
            "System Neural Audit": "Auditoría Neural del Sistema",
            "Real-time telemetry of the cognitive architecture.": "Telemetría en tiempo real de la arquitectura cognitiva.",
            "Knowledge Vectors": "Vectores de Conocimiento",
            "Cognitive Entropy": "Entropía Cognitiva",
            "Stability": "Estabilidad",
            "Infrastructure Scale": "Escala de Infraestructura",
            "Active Spaces": "Espacios Activos",
            "Editorial Products": "Productos Editoriales",
            "Total Decisions Logged": "Total de Decisiones Registradas",
            "System uptime: 99.9%. Last reboot: 26 mins ago.": "Tiempo de actividad: 99.9%. Último reinicio: hace 26 min.",
            "Recent Activity": "Actividad Reciente",
            "Decision Ledger Stream": "Flujo de Registro de Decisiones",
            "Immutable record of all cognitive engine actions.": "Registro inmutable de todas las acciones del motor cognitivo.",
            "Action": "Acción",
            "Target ID": "ID Objetivo",
            "Confidence": "Confianza",
            "Reasoning": "Razonamiento",
            "No explicit reasoning recorded.": "No se registró razonamiento explícito.",
            "No recent audit events found.": "No se encontraron eventos de auditoría recientes.",
            "Editorial Level:": "Nivel Editorial:",
            "Structure": "Estructura",
            "This section is empty.": "Esta sección está vacía.",
            "Select a section to begin writing, or generate a structure.": "Seleccione una sección para comenzar a escribir, o genere una estructura.",
            "Design Specifications": "Especificaciones de Diseño",
            "Base Font": "Fuente Base",
            "Default (System UI)": "Predeterminado (Sistema UI)",
            "Inter (Modern)": "Inter (Moderno)",
            "Georgia (Classic)": "Georgia (Clásico)",
            "Courier (Draft)": "Courier (Borrador)",
            "Primary Color": "Color Primario",
            "Accent Color": "Color de Acento",
            "Knowledge Library": "Biblioteca de Conocimiento",
            "Loading library...": "Cargando biblioteca...",
            "Weight:": "Peso:",
            "Syncing with cortex...": "Sincronizando con córtex...",
            "Idea not found in memory.": "Idea no encontrada en memoria.",
            "Raw inputs that have been attached to this idea by the Cognitive Engine.": "Entradas crudas adjuntas a esta idea por el Motor Cognitivo.",
            "No direct fragments linked (Genesis might differ).": "Sin fragmentos directos vinculados (Génesis podría diferir).",
            "Loading fragments...": "Cargando fragmentos...",
            "Content Preview": "Vista Previa de Contenido",
            "Actions": "Acciones",
            "Loading detail...": "Cargando detalle...",
            "Not found": "No encontrado",
            "Payload (Invariant)": "Payload (Invariante)",
            "Original text content injected into the system.": "Contenido de texto original inyectado en el sistema.",
            "Cognitive Audit Trace": "Rastro de Auditoría Cognitiva",
            "No decisions recorded": "Sin decisiones registradas",
            "This fragment may have been ingested before the audit ledger was active.": "Este fragmento pudo haber sido ingerido antes de activar el libro mayor de auditoría.",
            "Conf:": "Conf:",
            "Target Entity": "Entidad Objetivo",
            "Execution Metadata": "Metadatos de Ejecución",
            "ProTip:": "ProTip:",
            "Kolozus Semantic Search": "Búsqueda Semántica Kolozus"

        }
    };

    const t = (key: string, fallback?: string) => {
        return dictionary[language]?.[key] || fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
