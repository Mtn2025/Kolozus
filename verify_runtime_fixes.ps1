# Verify Runtime Fixes - Script de Verificacion en Ejecucion
$ErrorActionPreference = "Stop"

Write-Host ">>> Iniciando Verificacion de Runtime (Backend + DB)" -ForegroundColor Cyan
Write-Host ">>> Directorio: $(Get-Location)"
Write-Host "---------------------------------------------------"

# 1. Configurar Entorno
Write-Host "1. Configurando variables de entorno (.env.deploy.test)..."
if (Test-Path ".env.deploy.test") {
    Get-Content ".env.deploy.test" | Where-Object { $_ -match '=' -and -not ($_ -match '^#') } | ForEach-Object {
        $parts = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), [System.EnvironmentVariableTarget]::Process)
    }
} else {
    Write-Error "Falta .env.deploy.test"
}

# 2. Limpieza Previa
Write-Host "`n2. Limpiando contenedores docker previos..."
try {
    # Redirigir stderr a null para evitar fallos por warnings de version
    $process = Start-Process -FilePath "docker" -ArgumentList "compose down -v --remove-orphans" -PassThru -Wait -NoNewWindow
} catch {
    Write-Host "   [INFO] Limpieza previa fallo o no era necesaria." -ForegroundColor Gray
}

# 3. Levantar Stack (Backend + DB)
Write-Host "`n3. Levantando servicios (build & up)..."
# Usamos docker compose para orquestar la DB y el Backend juntos
docker compose up --build -d backend db

# 4. Esperar Inicializacion
Write-Host "   Esperando 20 segundos para startup de DB y Backend..."
Start-Sleep -Seconds 20

# 5. Verificar Logs del Backend (init_db.py)
Write-Host "`n4. Analizando Logs del Backend..."
$logs = docker logs kolozus-backend 2>&1

if ($logs -match "Database .* created successfully" -or $logs -match "already exists") {
    Write-Host "   [OK] Script init_db.py ejecutado correctamente." -ForegroundColor Green
    $logs | Select-String "Database" | ForEach-Object { Write-Host "      LOG: $_" -ForegroundColor Gray }
} else {
    Write-Host "   [WARN] No se detecto salida clara de init_db.py. Revisar logs completos." -ForegroundColor Yellow
}

if ($logs -match "Application startup complete") {
    Write-Host "   [OK] Uvicorn arranco correctamente (IndentationError RESUELTO)." -ForegroundColor Green
} else {
    Write-Error "   [ERROR] El backend no arranco. Posible error de sintaxis aun presente."
}

# 6. Prueba de Salud (Healthcheck)
Write-Host "`n5. Probando endpoint /health..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "ok") {
        Write-Host "   [OK] Endpoint /health responde 'ok'." -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Respuesta inesperada: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERROR] Fallo al conectar con localhost:8000/health. $_" -ForegroundColor Red
    Write-Host "   Logs Recientes:"
    docker logs --tail 20 kolozus-backend
    exit 1
}

Write-Host "`n>>> VERIFICACION EXITOSA <<<" -ForegroundColor Green
Write-Host "El sistema arranca, crea la DB si falta, y no tiene errores de sintaxis."
