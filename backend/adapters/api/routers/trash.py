from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any
from uuid import UUID
from ports.repository import RepositoryPort
from infrastructure.dependencies import get_repository
from pydantic import BaseModel

router = APIRouter(prefix="/trash", tags=["Trash & Data Management"])

class BatchDeleteRequest(BaseModel):
    ids: List[UUID]

@router.get("/", response_model=List[Dict[str, Any]]) 
async def list_trash(
    repo: RepositoryPort = Depends(get_repository)
):
    """List all soft-deleted fragments."""
    fragments = await repo.list_deleted_fragments()
    return [f.model_dump() for f in fragments]

@router.post("/fragment/{fragment_id}", response_model=Dict[str, bool])
async def move_to_trash(
    fragment_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """Soft delete a fragment."""
    success = await repo.soft_delete_fragment(fragment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fragment not found")
    return {"success": True}

@router.post("/restore/fragment/{fragment_id}", response_model=Dict[str, bool])
async def restore_from_trash(
    fragment_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """Restore a fragment from trash."""
    success = await repo.restore_fragment(fragment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fragment not found")
    return {"success": True}

@router.delete("/permanent/fragment/{fragment_id}", response_model=Dict[str, bool])
async def delete_permanently(
    fragment_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """Hard delete a fragment. Irreversible."""
    success = await repo.hard_delete_fragment(fragment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fragment not found")
    return {"success": True}

@router.post("/batch/fragments", response_model=Dict[str, int])
async def batch_move_to_trash(
    payload: BatchDeleteRequest,
    repo: RepositoryPort = Depends(get_repository)
):
    """Soft delete multiple fragments at once."""
    count = await repo.soft_delete_batch_fragments(payload.ids)
    return {"deleted_count": count}
