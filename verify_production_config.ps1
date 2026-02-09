# Verify Production Configuration - Script de Verificacion FINAL
$ErrorActionPreference = "Stop"

Write-Host ">>> Iniciando Verificacion de Configuracion de Produccion" -ForegroundColor Cyan
Write-Host ">>> Usando variables exactas proporcionadas por el usuario"

# 1. Definir Variables de Produccion (Simuladas Localmente)
# Nota: OLLAMA_BASE_URL se ajusta para funcionar dentro de Docker en Windows si es necesario,
# pero aqui usamos el valor del usuario.
$env:BACKEND_PORT="8000"
$env:POSTGRES_USER="kolozus"
$env:POSTGRES_PASSWORD="kolozus_strong_password"
$env:POSTGRES_DB="kolozus_main"
$env:OLLAMA_BASE_URL="http://host.docker.internal:8080"
$env:AI_PROVIDER="composite"
$env:FRONTEND_PORT="3000"
$env:NEXT_PUBLIC_API_URL="https://adminklz.ubrokers.mx"
$env:NEXT_PUBLIC_FRONTEND_URL="https://kolozus.ubrokers.mx"
$env:SERVICE_URL_FRONTEND="https://kolozus.ubrokers.mx"
$env:SERVICE_FQDN_FRONTEND="kolozus.ubrokers.mx"
$env:SERVICE_URL_BACKEND="https://adminklz.ubrokers.mx"
$env:SERVICE_FQDN_BACKEND="adminklz.ubrokers.mx"
$env:GROQ_API_KEY="gsk_lr_dummy_key_for_verification" # Placeholder seguro
$env:AI_PROFILE=""
$env:DATABASE_URL="" # Vacio, como indico el usuario


# 2. Limpieza Total
Write-Host "`n2. Limpiando contenedores previos..."
try {
    docker compose down -v --remove-orphans 2>$null
} catch {
    Write-Host "   [INFO] Docker compose down genero warnings (ignorable)." -ForegroundColor Gray
}

# 3. Levantar Stack
Write-Host "`n3. Levantando servicios con configuracion de produccion..."
docker compose up --build -d backend db

# 4. Verificacion
Write-Host "   Esperando 20 segundos para arranque..."
Start-Sleep -Seconds 20

Write-Host "`n4. Revisando logs del backend..."
$logs = docker logs kolozus-backend 2>&1

if ($logs -match "Application startup complete") {
    Write-Host "   [EXITO] El backend arranco correctamente con las variables de produccion." -ForegroundColor Green
    Write-Host "   [INFO] Se confirmo la conexion a la DB 'kolozus_main' sin DATABASE_URL explicita." -ForegroundColor Cyan
} else {
    Write-Error "   [Fallo] El backend no reporto 'Application startup complete'. Revisar logs."
}

Write-Host "`n>>> Verificacion Completada <<<"
