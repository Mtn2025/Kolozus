# Kolozus - Sistema de Gestión de Conocimiento Evolutivo

## Descripción
Kolozus es un sistema de gestión de conocimiento evolutivo que transforma texto desordenado en contenido estructurado y consultable, sin perder el rastro de la evolución intelectual.

## Características Principales
- ✅ **Knowledge Spaces**: Aislamiento cognitivo por tema
- ✅ **Cognitive Engine**: Motor de evolución de ideas determinista
- ✅ **Editorial Engine**: Pipeline fraccionado de creación editorial
- ✅ **Multi-Provider AI**: Soporte para Groq, Ollama y MockAI
- ✅ **Theme System**: 8 themes profesionales en 4 categorías
- ✅ **Multi-Language**: Soporte EN/ES con traducciones completas

## Arquitectura
- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14+ (TypeScript, App Router)
- **Base de Datos**: PostgreSQL 16 + pgvector
- **IA**: Groq Cloud, Ollama Local, MockAI
- **Infraestructura**: Docker Compose (compatible con Coolify)

## Despliegue Rápido

### En Coolify (Recomendado para Producción)
1. Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas
2. Configurar variables de entorno en Coolify UI
3. Deploy automático

### En Local (Desarrollo)
```bash
# 1. Clonar repositorio
git clone https://github.com/tuusuario/kolozus.git
cd kolozus

# 2. Crear archivo .env (ver .env.example)
cp .env.example .env
# Editar .env con tus valores

# 3. Levantar stack
docker-compose up -d

# 4. Acceder
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

## Estructura del Proyecto
```
kolozus/
├── backend/          # FastAPI backend
│   ├── adapters/     # Puertos y adaptadores
│   ├── domain/       # Lógica de dominio
│   ├── infrastructure/ # Infraestructura
│   └── main.py       # Punto de entrada
├── frontend/         # Next.js frontend
│   ├── app/          # App Router
│   ├── components/   # Componentes React
│   ├── lib/          # Librerías y utils
│   └── public/       # Assets estáticos
├── docker-compose.yml
├── .env.example
├── DEPLOY.md
└── README.md
```

## Variables de Entorno
Ver `.env.example` para lista completa. Variables críticas:
- `DATABASE_URL`: Conexión a PostgreSQL
- `AI_PROVIDER`: mock|groq|ollama
- `AI_PROFILE`: maestro|spark|guardian
- `NEXT_PUBLIC_API_URL`: URL del backend (frontend)

## Licencia
MIT

## Contribuciones
¡Bienvenidas! Por favor lee CONTRIBUTING.md
