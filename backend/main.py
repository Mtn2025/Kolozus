from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Added this import for CORSMiddleware
from infrastructure.database import engine, Base
from adapters.api.routers import ingestion, pipeline, query, audit, trash, spaces, products, ai_config, ui_config

# Create Tables (Simple "Walking Skeleton" approach)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kolozus API",
    description="Cognitive Engine for Evolutionary Knowledge",
    version="0.1.0"
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
