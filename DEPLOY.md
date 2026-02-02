# Deploy Instructions (Coolify / Docker)

This project uses Docker Compose for orchestration. It is stateless and safe for multi-instance deployment.

## 1. Environment Variables (Required)

Configure these in Coolify (Project -> Environment Variables).

### Backend
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string | `postgresql://user:pass@db:5432/db` |
| `GROQ_API_KEY` | API Key for Groq Cloud | `gsk_...` |
| `OLLAMA_BASE_URL` | URL for Ollama instances | `http://host.docker.internal:11434` (Local) or Public IP |
| `AI_PROVIDER` | AI Strategy | `composite` |
| `PORT` | Listening Port | `8000` |

### Database (PostgreSQL)
Managed by Coolify automatically, but if manual:
| Variable | Description |
| :--- | :--- |
| `POSTGRES_USER` | `kolozus` |
| `POSTGRES_PASSWORD` | `[SECURE_PASSWORD]` |
| `POSTGRES_DB` | `kolozus_main` |

---

## 2. Persistence

*   **Database:** PostgreSQL data is persisted in the `data/postgres` volume.
*   **Settings:** AI and UI settings are now stored in the Database (`ai_settings`, `ui_settings` tables).
*   **Local Files:** `ai_config.json` is IGNORED and NOT used in production.

## 3. Auto-Migration

The backend uses a "Walking Skeleton" approach (`Base.metadata.create_all`).
*   On every startup, it checks connection to DB.
*   It automatically creates missing tables (`ai_settings`, `ui_settings`, etc).
*   **No manual migration command is needed.**

## 4. Healthchecks

*   **Backend:** `curl http://localhost:8000/` (Interval: 30s)
*   **Database:** `pg_isready`
*   **AI:** Internal check via `CompositeAIProvider` logs errors if keys are missing.

---

**STATUS: READY FOR PRODUCTION PUSH** 🚀
