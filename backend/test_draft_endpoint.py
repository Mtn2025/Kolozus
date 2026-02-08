"""
Draft Generation Endpoint for Sections
Implements POST /products/{product_id}/sections/{section_id}/draft
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from uuid import UUID
from pydantic import BaseModel
from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort
from infrastructure.dependencies import get_repository, get_ai_provider
from domain.services.drafter import Drafter

class GenerateDraftRequest(BaseModel):
    level: int  # 0=Raw, 1=Clean, 2=Flow, 3=Deep
    context: Dict[str, Any]  # space_id, idea_ids, etc.

async def generate_draft(
    product_id: UUID,
    section_id: UUID,
    payload: GenerateDraftRequest,
    repo: RepositoryPort = Depends(get_repository),
    ai: AIProviderPort = Depends(get_ai_provider)
):
    """Generate draft content for a section at specified intervention level."""
    # 1. Get section
    section = repo.get_section(section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # 2. Validate section belongs to product
    if section.product_id != product_id:
        raise HTTPException(status_code=400, detail="Section does not belong to this product")
    
    # 3. Generate draft via Drafter service
    drafter = Drafter(repo, ai)
    
    # Extract context
    space_id = payload.context.get('space_id')
    idea_ids = payload.context.get('idea_ids', [])
    
    # Generate content based on intervention level
    content = await drafter.generate_content(
        section_id=section_id,
        level=payload.level,
        space_id=UUID(space_id) if space_id else None,
        idea_ids=[UUID(id) for id in idea_ids] if idea_ids else []
    )
    
    # 4. Update section with generated content
    section.content = content
    section.intervention_level = payload.level
    repo.update_section(section)
    
    # 5. Calculate word count
    # Simple word count (can be improved)
    import re
    text = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    word_count = len(text.split())
    
    # 6. Return response
    return {
        "section_id": str(section_id),
        "level": payload.level,
        "content": content,
        "word_count": word_count,
        "status": "draft_completed"
    }
