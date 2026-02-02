# Kolozus
**Evolutive Knowledge Management System**

Kolozus is a self-hosted system designed to manage the evolution of ideas, from raw fragments to synthesized concepts.

## Architecture
- **Backend**: FastAPI (Python) - Hexagonal Architecture
- **Database**: PostgreSQL 16 + pgvector
- **Frontend**: Next.js 14 + Tailwind + Shadcn/UI
- **Infrastructure**: Docker Compose

## Quick Start
1. Ensure Docker Desktop is running.
2. Run `docker-compose up -d` to start the database.
3. See individual `backend/` and `frontend/` READMEs for development service startup.
