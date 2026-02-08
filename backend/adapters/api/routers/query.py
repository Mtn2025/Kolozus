from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any, Optional
from uuid import UUID

from infrastructure.dependencies import get_repository, get_ai_provider
from ports.repository import RepositoryPort
from domain.models import Idea, IdeaVersion, Fragment
from i18n import t, get_language_from_header

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
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Get raw fragment detail.
    """
    fragment = await repo.get_fragment(fragment_id)
    if not fragment:
        lang = get_language_from_header(accept_language)
        # Assuming we might want a generic translation for not found if specific one doesn't exist
        raise HTTPException(status_code=404, detail=t("space_not_found", lang).replace("Espacio", "Fragmento").replace("Space", "Fragment"))
    return fragment

@router.get("/idea/{idea_id}", response_model=Idea)
async def get_idea_detail(
    idea_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Get full details of an Idea, including its Semantic Profile (centroid).
    """
    idea = await repo.get_idea(idea_id)
    if not idea:
        lang = get_language_from_header(accept_language)
        raise HTTPException(status_code=404, detail=t("product_not_found", lang).replace("Producto", "Idea").replace("Product", "Idea"))
    return idea

@router.get("/idea/{idea_id}/history", response_model=List[IdeaVersion])
async def get_idea_history(
    idea_id: UUID, 
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Get evolution history (versions) of an Idea.
    """
    versions = await repo.list_idea_versions(idea_id)
    if not versions:
         # Check if idea exists to generic 404
        idea = await repo.get_idea(idea_id)
        if not idea:
            lang = get_language_from_header(accept_language)
            raise HTTPException(status_code=404, detail=t("product_not_found", lang).replace("Producto", "Idea").replace("Product", "Idea"))
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

@router.get("/knowledge-graph", response_model=Dict[str, Any])
async def get_knowledge_graph(
    space_id: UUID = None,
    repo: RepositoryPort = Depends(get_repository)
):
    """
    Knowledge Graph view with nodes and edges.
    """
    ideas = await repo.list_ideas(space_id=space_id)
    
    nodes = []
    for idea in ideas:
        node = {
            "id": str(idea.id),
            "label": idea.title_provisional,
            "status": idea.status,
            "weight": idea.semantic_profile.fragment_count if idea.semantic_profile else 0,
            "domain": idea.domain
        }
        nodes.append(node)
    
    edges = []
    similarity_threshold = 0.3
    
    for i, idea1 in enumerate(ideas):
        if not idea1.semantic_profile or not idea1.semantic_profile.centroid:
            continue
            
        for j, idea2 in enumerate(ideas):
            if i >= j:
                continue
                
            if not idea2.semantic_profile or not idea2.semantic_profile.centroid:
                continue
            
            vec1 = idea1.semantic_profile.centroid
            vec2 = idea2.semantic_profile.centroid
            
            import math
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            magnitude1 = math.sqrt(sum(a * a for a in vec1))
            magnitude2 = math.sqrt(sum(a * a for a in vec2))
            
            if magnitude1 > 0 and magnitude2 > 0:
                similarity = dot_product / (magnitude1 * magnitude2)
                
                if similarity >= similarity_threshold:
                    edge = {
                        "source": str(idea1.id),
                        "target": str(idea2.id),
                        "similarity": round(similarity, 3)
                    }
                    edges.append(edge)
    
    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "space_id": str(space_id) if space_id else None
        }
    }

@router.post("/search", response_model=Dict[str, Any])
async def search_knowledge(
    payload: Dict[str, Any],
    repo: RepositoryPort = Depends(get_repository),
    ai_provider = Depends(get_ai_provider),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    """
    Semantic Search: Finds ideas and fragments semantically similar to the query.
    """
    lang = get_language_from_header(accept_language)
    query_text = payload.get("query")
    if not query_text:
        raise HTTPException(status_code=400, detail=t("missing_field", lang))
    
    space_id = payload.get("space_id")
    limit = payload.get("limit", 5)
    search_type = payload.get("type", "all")
    
    try:
        # 1. Generate Embedding
        vector = await ai_provider.generate_embedding(query_text)
        
        # 2. Search based on type
        results = []
        
        if search_type in ["all", "ideas"]:
            idea_limit = limit if search_type == "ideas" else max(3, limit // 2)
            idea_candidates = await repo.search_candidates(
                vector, 
                limit=idea_limit,
                space_id=UUID(space_id) if space_id else None
            )
            
            for idea, score in idea_candidates:
                snippet = idea.title_provisional if idea.title_provisional else "Sin descripción"
                if len(snippet) > 150:
                    snippet = snippet[:147] + "..."
                
                results.append({
                    "type": "idea",
                    "id": str(idea.id),
                    "title": idea.title_provisional,
                    "status": idea.status,
                    "similarity": round(score, 4),
                    "domain": idea.domain,
                    "snippet": snippet
                })
        
        if search_type in ["all", "fragments"]:
            fragment_limit = limit if search_type == "fragments" else max(2, limit // 2)
            fragments = await repo.list_fragments(limit=fragment_limit * 2)
            
            fragment_results = []
            for fragment in fragments:
                if space_id and str(fragment.space_id) != space_id:
                    continue
                
                score = 0.5 
                
                snippet = fragment.raw_text if fragment.raw_text else "Sin contenido"
                if len(snippet) > 150:
                    snippet = snippet[:147] + "..."
                
                fragment_results.append({
                    "type": "fragment",
                    "id": str(fragment.id),
                    "title": f"Fragment de {fragment.source or 'fuente desconocida'}",
                    "similarity": score,
                    "snippet": snippet,
                    "source": fragment.source
                })
            
            fragment_results.sort(key=lambda x: x["similarity"], reverse=True)
            results.extend(fragment_results[:fragment_limit])
        
        results.sort(key=lambda x: x["similarity"], reverse=True)
        results = results[:limit]
        
        if not results:
             # Just return empty list, but we could return message.
             # Frontend handles empty state.
             pass

        return {
            "results": results,
            "metadata": {
                "total": len(results),
                "query": query_text,
                "space_id": space_id,
                "search_type": search_type
            }
        }
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=t("search_error", lang))
