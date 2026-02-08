# Despliegue en Coolify

## Pre-requisitos
- Cuenta en Coolify
- Repositorio en GitHub/GitLab conectado a Coolify
- Dominio configurado (opcional)

## Pasos para despliegue

### 1. Crear nuevo proyecto en Coolify
- Ir a Coolify → New Project
- Seleccionar "Docker Compose"
- Conectar repositorio de GitHub

### 2. Configurar Variables de Entorno en Coolify UI

#### Base de Datos
POSTGRES_USER=kolozus_prod
POSTGRES_PASSWORD=<generar_contraseña_segura>
POSTGRES_DB=kolozus_prod
POSTGRES_HOST=db
DATABASE_URL=postgresql://kolozus_prod:<password>@db:5432/kolozus_prod


#### Backend
BACKEND_PORT=8000
AI_PROVIDER=mock # o groq/ollama según necesidad
AI_PROFILE=guardian # o maestro/spark
GROQ_API_KEY=<tu_api_key_de_groq> # solo si AI_PROVIDER=groq
OLLAMA_BASE_URL=http://ollama:11434 # solo si AI_PROVIDER=ollama


#### Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=https://api.tudominio.com # o http://backend:8000 si mismo servidor


#### CORS (Opcional)

CORS_ALLOWED_ORIGINS=https://tudominio.com


### 3. Configurar Puertos en Coolify
- Backend: 8000 (HTTP)
- Frontend: 3000 (HTTP)
- PostgreSQL: 5432 (TCP - solo para conexión interna)
- Ollama: 11434 (TCP - solo si se usa)

### 4. Configurar Volúmenes
- `postgres_data` → /var/lib/postgresql/data
- `ollama_data` → /root/.ollama (solo si se usa Ollama)

### 5. Configurar Health Checks
- Backend: `GET /health` → 200 OK
- Frontend: `GET /` → 200 OK
- Database: `pg_isready` → 0
- Ollama: `GET /` → 200 OK (solo si se usa)

### 6. Deploy
- Click en "Deploy"
- Esperar a que Coolify construya y despliegue
- Verificar logs para errores

### 7. Post-Deploy
- Verificar que todos los servicios están saludables
- Acceder al frontend: https://tudominio.com
- Verificar API: https://api.tudominio.com/health
- Probar funcionalidades básicas

## Troubleshooting

### Error: "Database connection failed"
- Verificar que DATABASE_URL es correcto
- Verificar que PostgreSQL está saludable
- Verificar logs de backend

### Error: "CORS policy"
- Verificar CORS_ALLOWED_ORIGINS
- Verificar que el dominio frontend coincide con el permitido

### Error: "AI Provider not configured"
- Verificar AI_PROVIDER y AI_PROFILE
- Verificar API keys si se usan proveedores cloud

## Escalabilidad

### Añadir más instancias
- En Coolify, escalar réplicas de backend/frontend
- Configurar load balancer si es necesario

### Backup de base de datos
- Configurar backup automático en Coolify
- O usar pg_dump manualmente

### Monitorización
- Configurar logs en Coolify
- Usar métricas de Docker
- Configurar alertas si es necesario