from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from infrastructure.dependencies import get_pipeline
from domain.services.pipeline import CognitivePipeline
from domain.models import Fragment
from i18n import t, get_language_from_header
import uuid

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

class IngestRequest(BaseModel):
    text: str
    source: str | None = None
    mode: str = "default" # default, explorer, consolidator
    space_id: str | None = None # UUID string
    model_name: str | None = None # Optional model override

@router.post("/", response_model=Dict[str, Any])
async def ingest_fragment(
    request: IngestRequest,
    pipeline: CognitivePipeline = Depends(get_pipeline),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Recibe texto crudo y lo procesa a través del pipeline cognitivo.
    """
    lang_code = get_language_from_header(accept_language)
    
    if not request.text.strip():
        from adapters.api.errors import APIError
        raise APIError(status_code=422, message="Text cannot be empty", code="TEXT_REQUIRED")
    lang_code = get_language_from_header(accept_language)
    
    try:
        action = await pipeline.process_text(request.text, request.source, mode=request.mode, space_id=request.space_id, language=lang_code)
        return {
            "status": "processed",
            "decision": action.action,
            "target_idea": str(action.target_idea_id) if action.target_idea_id else None,
            "message": t("ingest_success", lang_code)
        }
    except Exception as e:
        import traceback
        err_str = str(e)
        if "duplicate key" in err_str.lower() or "unique constraint" in err_str.lower():
             return {
                "status": "skipped",
                "decision": "duplicate",
                "target_idea": None,
                "note": "Fragment already exists",
                "message": t("ingest_error", lang_code)
             }

        traceback.print_exc()
        # Return original error for debugging, concatenated with localized message
        error_detail = f"{t('ingest_error', lang_code)}: {str(e)}"
        raise HTTPException(status_code=500, detail=error_detail)

@router.post("/batch", response_model=Dict[str, Any])
async def ingest_batch(
    request: IngestRequest, # Reuse model but treat text as potentially containing delimiters? Or different model? 
    # NOTE: The frontend sends { texts: [], ... } for batch. We need a different model!
    pipeline: CognitivePipeline = Depends(get_pipeline),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    # This is a placeholder as the original file didn't have batch. 
    # Assumed implementation based on Frontend call
    pass 
