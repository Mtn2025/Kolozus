from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from uuid import UUID

from infrastructure.dependencies import get_repository, get_ai_provider
from ports.repository import RepositoryPort
from domain.models import Idea, IdeaVersion, Fragment

router = APIRouter(prefix="/query", tags=["Cognitive Query"])

@router.get("/fragments", response_model=List[Fragment])
async def list_fragments(
    limit: int = 50,
    offset: int = 0,
    repo: RepositoryPort = Depends(get_repository)
):
    """
    List raw fragments (Observability).
    """
    return await repo.list_fragments(limit, offset)

@router.get("/fragment/{fragment_id}", response_model=Fragment)
async def get_fragment_detail(
    fragment_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Get raw fragment detail.
    """
    fragment = await repo.get_fragment(fragment_id)
    if not fragment:
        raise HTTPException(status_code=404, detail="Fragment not found")
    return fragment

@router.get("/idea/{idea_id}", response_model=Idea)
async def get_idea_detail(
    idea_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Get full details of an Idea, including its Semantic Profile (centroid).
    """
    idea = await repo.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea

@router.get("/idea/{idea_id}/history", response_model=List[IdeaVersion])
async def get_idea_history(
    idea_id: UUID, 
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Get evolution history (versions) of an Idea.
    """
    versions = await repo.list_idea_versions(idea_id)
    # Validate idea exists if list is empty? Optional.
    if not versions:
         # Check if idea exists to generic 404
        idea = await repo.get_idea(idea_id)
        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found")
        return []
    return versions

@router.get("/idea/{idea_id}/fragments", response_model=List[Fragment])
async def get_idea_fragments(
    idea_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Get fragments that contributed to this Idea (Provenance).
    """
    return await repo.list_fragments_by_idea(idea_id)

@router.get("/knowledge-graph", response_model=List[Dict[str, Any]])
async def get_knowledge_graph(
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Lightweight graph view. Returns a list of nodes (Ideas) with:
    id, title, status, semantic_count.
    (Future: Add edges/links)
    """
    ideas = await repo.list_ideas()
     # Transform to lightweight format
    graph_nodes = []
    for idea in ideas:
        node = {
            "id": str(idea.id),
            "label": idea.title_provisional,
            "status": idea.status,
            "weight": idea.semantic_profile.fragment_count if idea.semantic_profile else 0
        }
        graph_nodes.append(node)
@router.post("/search", response_model=List[Dict[str, Any]])
async def search_knowledge(
    payload: Dict[str, str], # {"query": "text"}
    repo: RepositoryPort = Depends(get_repository),
    ai_provider = Depends(get_ai_provider) # Dynamic provider
):
    """
    Semantic Search: Finds ideas semantically approximate to the query.
    1. Embeds query using active AI Provider.
    2. Searches Vector Store (via Repository).
    """
    query_text = payload.get("query")
    if not query_text:
         raise HTTPException(status_code=400, detail="Query text required")
    
    # 1. Generate Embedding
    vector = await ai_provider.generate_embedding(query_text)
    
    # 2. Search
    candidates = await repo.search_candidates(vector, limit=5)
    
    # 3. Format Response
    results = []
    for idea, score in candidates:
        results.append({
            "id": idea.id,
            "title": idea.title_provisional,
            "status": idea.status,
            "similarity": score,
            "domain": idea.domain
        })
        
    return results
