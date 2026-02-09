from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Dict, Any
from uuid import UUID
from infrastructure.dependencies import get_repository
from ports.repository import RepositoryPort
from domain.models import Space
from pydantic import BaseModel
from i18n import t, get_language_from_header

router = APIRouter(prefix="/spaces", tags=["Spaces"])

class SpaceCreate(BaseModel):
    name: str
    description: str | None = None
    icon: str | None = "folder"
    color: str | None = "blue"

class SpaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None

@router.get("/", response_model=List[Space])
def list_spaces(
    repo: RepositoryPort = Depends(get_repository)
):
    return repo.list_spaces()

from adapters.api.errors import APIError

@router.get("/{space_id}", response_model=Space)
def get_space(
    space_id: UUID, 
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    space = repo.get_space(space_id)
    if not space:
        lang = get_language_from_header(accept_language)
        raise APIError(status_code=404, message=t("space_not_found", lang), code="SPACE_NOT_FOUND")
    return space

@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(
    space_id: UUID, 
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    space = repo.get_space(space_id)
    lang = get_language_from_header(accept_language)
    
    if not space:
        raise APIError(status_code=404, message=t("space_not_found", lang), code="SPACE_NOT_FOUND")
        
    repo.delete_space(space_id)
    return None

@router.post("/", response_model=Space, status_code=status.HTTP_201_CREATED)
def create_space(
    space_in: SpaceCreate, 
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    saved_space = repo.create_space(
        name=space_in.name,
        description=space_in.description,
        icon=space_in.icon,
        color=space_in.color
    )
    return saved_space

@router.put("/{space_id}", response_model=Space)
def update_space(
    space_id: UUID, 
    space_in: SpaceUpdate, 
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    space = repo.get_space(space_id)
    lang = get_language_from_header(accept_language)
    
    if not space:
        raise HTTPException(status_code=404, detail=t("space_not_found", lang))
    
    if space_in.name is not None:
        space.name = space_in.name
    if space_in.description is not None:
        space.description = space_in.description
    if space_in.icon is not None:
        space.icon = space_in.icon
    if space_in.color is not None:
        space.color = space_in.color
        
    repo.save_space(space)
    return space
