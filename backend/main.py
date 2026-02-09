from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from infrastructure.database import engine, Base
from adapters.api.routers import ingestion, pipeline, query, audit, trash, spaces, products, ai_config, ui_config, stats
from domain.exceptions import DomainError, EmbeddingError, ModelError, DatabaseError, NetworkError

import time
from sqlalchemy.exc import OperationalError

# Robust DB Initialization
def init_db(retries=10, delay=2):
    from sqlalchemy import text
    for i in range(retries):
        try:
            print(f"Attempting DB connection ({i+1}/{retries})...")
            # Create pgvector extension first
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            # Then create all tables
            Base.metadata.create_all(bind=engine)
            
            # --- AUTO MIGRATION: Add columns if missing ---
            # Safe to run on every startup
            with engine.connect() as conn:
                print("Checking for schema updates...")
                conn.execute(text("ALTER TABLE fragments ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en';"))
                conn.execute(text("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en';"))
                conn.execute(text("ALTER TABLE idea_versions ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en';"))
                conn.commit()
            
            print("DB Schema initialized successfully.")
            return
        except OperationalError as e:
            print(f"DB connection failed: {e}. Retrying in {delay}s...")
            time.sleep(delay)
    raise Exception("Could not connect to Database after multiple attempts.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB
    init_db()
    yield
    # Shutdown: (Optional cleanup)
    pass

app = FastAPI(
    title="Kolozus API",
    description="Cognitive Engine for Evolutionary Knowledge",
    version="0.1.0",
    lifespan=lifespan
)

# Exception Handlers
@app.exception_handler(DomainError)
async def domain_exception_handler(request: Request, exc: DomainError):
    status_code = 500
    if isinstance(exc, NetworkError):
        status_code = 503
    elif isinstance(exc, DatabaseError):
        status_code = 500
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "code": exc.code
        },
    )

from adapters.api.errors import APIError, api_error_handler
app.add_exception_handler(APIError, api_error_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error", 
            "message": str(exc),
            "traceback": traceback.format_exc().splitlines()[-1] # Brief trace
        },
    )

# CORS (Allow Frontend)
# CORS - Configuración para producción
import os

# Coolify configurará el dominio real via variable de entorno
# Ej: "https://kolozus.tudominio.com"
allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
allowed_origins = allowed_origins_env.split(",") if allowed_origins_env else ["*"]
print(f"CORS Allowed Origins: {allowed_origins}")

# Handle Wildcard + Credentials issue
allow_origin_regex = None
if len(allowed_origins) == 1 and allowed_origins[0] == "*":
    allow_origin_regex = ".*"
    allowed_origins = [] # Let regex handle it

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(ingestion.router)
app.include_router(query.router)
app.include_router(audit.router)
app.include_router(trash.router)
app.include_router(spaces.router)
app.include_router(products.router)
app.include_router(stats.router)
app.include_router(ai_config.router, prefix="/api/ai", tags=["AI Configuration"])
app.include_router(ui_config.router, prefix="/ui", tags=["UI Configuration"])

@app.get("/")
async def root():
    return {"message": "Kolozus Brain is Alive"}

@app.get("/health")
async def health():
    """Lightweight health check endpoint for container orchestration"""
    return {"status": "healthy"}
