from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from infrastructure.database import engine, Base
from adapters.api.routers import ingestion, pipeline, query, audit, trash, spaces, products, ai_config, ui_config

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

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev
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
app.include_router(ai_config.router, prefix="/api/ai", tags=["AI Configuration"])
app.include_router(ui_config.router, prefix="/api/ui", tags=["UI Configuration"])

@app.get("/")
async def root():
    return {"message": "Kolozus Brain is Alive"}

@app.get("/health")
async def health():
    """Lightweight health check endpoint for container orchestration"""
    return {"status": "healthy"}
