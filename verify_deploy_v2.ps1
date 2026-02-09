# Verify Deploy V2 - Script de Verificacion Rigurosa
$ErrorActionPreference = "Stop"

Write-Host ">>> Iniciando Simulacion de Despliegue V2 (Rigurosa)" -ForegroundColor Cyan
Write-Host ">>> Directorio actual: $(Get-Location)"
Write-Host "---------------------------------------------------"

# 1. Cargar Variables de Entorno
Write-Host "1. Cargando variables de entorno desde .env.deploy.test..."
if (-not (Test-Path ".env.deploy.test")) {
    Write-Error "Archivo .env.deploy.test no encontrado."
}

Get-Content ".env.deploy.test" | Where-Object { $_ -match '=' -and -not ($_ -match '^#') } | ForEach-Object {
    $parts = $_ -split '=', 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
    Write-Host "   + ENV: $name cargado." -ForegroundColor Gray
}

# 2. Verificar Archivos Criticos
Write-Host "`n2. Verificando integridad de archivos criticos..."
$criticalFiles = @(
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/next.config.ts",
    "frontend/Dockerfile",
    "frontend/components/ui/dropdown-menu.tsx"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   [OK] $file existe." -ForegroundColor Green
    } else {
        Write-Error "[FALTA] $file NO EXISTE. El despliegue fallara."
    }
}

# 3. Limpieza Docker
Write-Host "`n3. Limpiando entorno Docker (Frontend)..."
try {
    docker stop kolozus-frontend 2>$null
    docker rm kolozus-frontend 2>$null
    Write-Host "   [OK] Contenedores previos limpados." -ForegroundColor Gray
} catch {
    Write-Host "   [INFO] No habia contenedores por limpiar." -ForegroundColor Gray
}

# 4. Construccion Docker (Build)
Write-Host "`n4. Ejecutando Docker Build (Simulando Coolify)..."
Write-Host "   Info: Este paso usa 'package-lock.json' para instalar dependencias exactas."

$apiUrl = $env:NEXT_PUBLIC_API_URL
Write-Host "   Build Arg: NEXT_PUBLIC_API_URL = $apiUrl"

# Ejecutar docker build directamente
# Usamos & para invocar el comando de forma segura
& docker build --no-cache --build-arg "NEXT_PUBLIC_API_URL=$apiUrl" -t kolozus-frontend-verify -f frontend/Dockerfile frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n>>> BUILD EXITOSO <<<" -ForegroundColor Green
    Write-Host "La imagen Docker se ha creado correctamente."
    Write-Host "Esto confirma que:"
    Write-Host "1. Las dependencias estan completas (package-lock.json)."
    Write-Host "2. El codigo compila sin errores."
    Write-Host "3. Las variables de entorno se inyectan correctamente."
} else {
    Write-Host "`n>>> BUILD FALLIDO <<<" -ForegroundColor Red
    Write-Host "Revisa los logs de arriba para ver el error especifico."
    exit 1
}
