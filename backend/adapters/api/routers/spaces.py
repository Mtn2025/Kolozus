from fastapi import APIRouter, Depends, HTTPException, Header
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


@router.get("/{space_id}", response_model=Space)
def get_space(
    space_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    lang = get_language_from_header(accept_language)
    space = repo.get_space(space_id)
    if not space:
        raise HTTPException(status_code=404, detail=t("space_not_found", lang))
    return space

@router.get("/", response_model=List[Space])
def list_spaces(
    repo: RepositoryPort = Depends(get_repository)
):
    spaces = repo.list_spaces()
    return spaces

@router.post("/", response_model=Space)
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

@router.delete("/{space_id}")
def delete_space(
    space_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    lang = get_language_from_header(accept_language)
    repo.delete_space(space_id)
    return {"detail": t("space_deleted", lang)}

@router.get("/{space_id}/analytics", response_model=Dict[str, Any])
async def get_space_analytics(
    space_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Get analytics for a space: idea maturity distribution, fragment counts, etc.
    """
    from domain.services.maturity_calculator import MaturityCalculator
    
    lang = get_language_from_header(accept_language)
    space = repo.get_space(space_id)
    if not space:
        raise HTTPException(status_code=404, detail=t("space_not_found", lang))
    
    # Get all ideas in space
    ideas = await repo.list_ideas(space_id=space_id)
    fragments = await repo.list_fragments(space_id=space_id)
    
    # Calculate maturity distribution
    maturity_distribution = {"germinal": 0, "growing": 0, "mature": 0}
    idea_details = []
    
    for idea in ideas:
        idea_fragments = await repo.list_fragments_by_idea(idea.id)
        versions = await repo.list_idea_versions(idea.id)
        score = MaturityCalculator.calculate(idea, idea_fragments, len(versions))
        status = MaturityCalculator.get_status_label(score)
        
        maturity_distribution[status] += 1
        idea_details.append({
            "id": str(idea.id),
            "title": idea.title_provisional,
            "maturity_score": score,
            "maturity_status": status,
            "fragment_count": len(idea_fragments)
        })
    
    # Sort ideas by maturity score descending
    idea_details.sort(key=lambda x: x["maturity_score"], reverse=True)
    
    return {
        "space_id": str(space_id),
        "space_name": space.name,
        "total_fragments": len(fragments),
        "total_ideas": len(ideas),
        "maturity_distribution": maturity_distribution,
        "top_ideas": idea_details[:10],  # Top 10 most mature ideas
        "ready_for_product": sum(1 for i in idea_details if i["maturity_score"] >= 60)
    }
