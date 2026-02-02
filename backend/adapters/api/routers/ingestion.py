from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from typing import Dict, Any, List
# from ports.repository import RepositoryPort # Not needed directly if using pipeline
from infrastructure.dependencies import get_pipeline
from domain.services.pipeline import CognitivePipeline
from domain.models import Fragment
import uuid

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

class IngestRequest(BaseModel):
    text: str
    source: str | None = None
    mode: str = "default" # default, explorer, consolidator
    space_id: str | None = None # UUID string

@router.post("/", response_model=Dict[str, Any]) # Modified response_model
async def ingest_fragment(
    request: IngestRequest,
    pipeline: CognitivePipeline = Depends(get_pipeline), # Modified dependency
    accept_language: str = Header(default="en", alias="Accept-Language") # Extract Language
):
    """
    Recibe texto crudo y lo procesa a través del pipeline cognitivo.
    """
    # Normalize language (take first 2 chars, e.g. "es-ES" -> "es")
    lang_code = accept_language.split(",")[0].strip()[:2].lower()
    
    action = await pipeline.process_text(request.text, request.source, mode=request.mode, space_id=request.space_id, language=lang_code)
    return {
        "status": "processed",
        "decision": action.action,
        "target_idea": str(action.target_idea_id) if action.target_idea_id else None
    }

class BulkIngestRequest(BaseModel):
    items: List[IngestRequest]
    mode: str = "default" # Global override if needed
    space_id: str | None = None # Global space override

@router.post("/batch", response_model=List[Dict[str, Any]])
@router.post("/bulk", response_model=List[Dict[str, Any]], include_in_schema=False) # Legacy support
async def ingest_bulk(
    request: BulkIngestRequest,
    pipeline: CognitivePipeline = Depends(get_pipeline)
):
    results = []
    # Sequential processing to trace state changes cleanly
    # (Parallel processing might cause race conditions in 'search_candidates' vs 'save' if not locked)
    for item in request.items:
        # Use item mode if set specific, else global mode
        effective_mode = item.mode if item.mode != "default" else request.mode
        # Use item space if set specific, else global space
        effective_space = item.space_id if item.space_id else request.space_id
        
        action = await pipeline.process_text(item.text, item.source, mode=effective_mode, space_id=effective_space)
        results.append({
            "text_preview": item.text[:30],
            "decision": action.action,
            "target_idea": str(action.target_idea_id) if action.target_idea_id else None
        })
    return results
