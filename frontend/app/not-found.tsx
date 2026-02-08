export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-4">Page Not Found / Página No Encontrada</p>
                <a href="/" className="text-primary hover:underline">
                    Go Home / Ir al Inicio
                </a>
            </div>
        </div>
    )
}
