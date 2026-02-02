from fastapi import APIRouter, Depends
from pydantic import BaseModel
from domain.services.pipeline import CognitivePipeline
from domain.events import DecisionResult
from infrastructure.dependencies import get_pipeline

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

class PipelineTestRequest(BaseModel):
    text: str
    source: str = "test_console"

@router.post("/run", response_model=DecisionResult)
async def run_pipeline(
    request: PipelineTestRequest,
    pipeline: CognitivePipeline = Depends(get_pipeline)
):
    """
    Triggers the full Ingestion -> Embedding -> Decision -> Ledger flow.
    """
    decision = await pipeline.process_text(request.text, request.source)
    return decision
