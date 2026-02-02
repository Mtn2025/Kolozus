from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from uuid import UUID
from domain.services.ai_config_service import AIConfigService, AIProfile, DEFAULT_PROFILES
from infrastructure.dependencies import get_ai_config_service

router = APIRouter()

class UpdateProfileRequest(BaseModel):
    profile_name: str
    custom_config: Optional[Dict[str, Any]] = None
    # In a real auth scenario, user_id comes from token, not body usually.
    # But for now we can default it or allow dev overrides.

@router.get("/config", response_model=AIProfile)
async def get_ai_config(
    service: AIConfigService = Depends(get_ai_config_service)
):
    """Returns the current active AI configuration (Default User for now)."""
    # TODO: Extract user_id from auth token
    user_id = None 
    return service.get_config(user_id=user_id)

@router.post("/config")
async def update_ai_config(
    request: UpdateProfileRequest,
    service: AIConfigService = Depends(get_ai_config_service)
):
    """
    Updates the active AI profile.
    """
    try:
        # TODO: Extract user_id from auth token
        user_id = None
        service.save_config(request.profile_name, user_id=user_id, custom_config=request.custom_config)
        return {"status": "success", "profile": request.profile_name}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/defaults")
async def get_default_profiles():
    """Returns the default definitions for templates."""
    return DEFAULT_PROFILES
