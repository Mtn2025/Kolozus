from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional
from uuid import UUID
from ports.repository import RepositoryPort
from infrastructure.dependencies import get_repository
from pydantic import BaseModel
from domain.models import Space

router = APIRouter(prefix="/spaces", tags=["Knowledge Spaces"])

class CreateSpaceRequest(BaseModel):
    name: str
    description: Optional[str] = None

@router.get("/", response_model=List[Space]) 
async def list_spaces(
    repo: RepositoryPort = Depends(get_repository)
):
    """List all available spaces."""
    return repo.list_spaces()

@router.post("/", response_model=Space)
async def create_space(
    payload: CreateSpaceRequest,
    repo: RepositoryPort = Depends(get_repository)
):
    """Create a new knowledge space."""
    return repo.create_space(name=payload.name, description=payload.description)

@router.get("/{space_id}", response_model=Space)
async def get_space(
    space_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    space = repo.get_space(space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space
