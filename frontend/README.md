# Kolozus Frontend (Next.js 14)

Este es el frontend moderno de la plataforma cognitiva Kolozus, construido con Next.js 14 (App Router), TypeScript, Tailwind CSS y Shadcn/UI.

## Estructura del Proyecto

El proyecto está organizado verticalmente por dominios de negocio:

*   **`app/`**: Rutas de la aplicación (Pages & Layouts).
    *   `spaces/`: Gestión de Grafos de Conocimiento.
    *   `publisher/`: Estudio Editorial (Creación de Productos).
    *   `library/`: Visualización (Graph) y Búsqueda Semántica.
    *   `audit/`: Dashboard de Observabilidad (Logs & Métricas).
    *   `ingest/`: Ingesta de datos (Texto/Batch).
*   **`components/`**: Componentes de UI.
    *   `ui/`: Primitivas de diseño (Botones, Inputs, Cards) - Shadcn.
    *   `spaces/`, `publisher/`, `library/`, `audit/`: Componentes específicos de dominio.
*   **`services/`**: Integración con API Backend (`api.ts`, `audit.ts`).
*   **`types/`**: Definiciones de tipos TypeScript (`index.ts`, `audit.ts`).
*   **`store/`**: Gestión de estado global (Zustand) - *En desarrollo*.

## Setup & Ejecución

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    El servidor arrancará en `http://localhost:3000` (o `3001` si el puerto está ocupado).

## Stack Tecnológico

*   **Framework**: Next.js 14.1
*   **Estilos**: Tailwind CSS + CSS Variables (Temas dinámicos).
*   **UI Kit**: Shadcn/UI (Radix Primitives).
*   **Iconos**: Lucide React.
*   **Visualización**: `react-force-graph-2d` (Grafo de Conocimiento).
*   **Notificaciones**: `sonner`.
*   **Utilidades**: `clsx`, `tailwind-merge`, `use-debounce`.

## Características Clave

*   **Multi-Workspace**: Gestión aislada de espacios de conocimiento.
*   **Motor Editorial**: Generación de blueprints y borradores con IA.
*   **Observabilidad**: Monitorización en tiempo real de la "psique" del sistema (Entropía).
*   **Búsqueda Semántica**: Recuperación de información basada en embeddings.
