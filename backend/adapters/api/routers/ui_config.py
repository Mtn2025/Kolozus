from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from domain.services.ui_config_service import UIConfigService, UIConfig
from infrastructure.dependencies import get_ui_config_service

router = APIRouter()

class UpdateUIConfigRequest(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None  # ✅ Added language support

@router.get("/config", response_model=UIConfig)
async def get_ui_config(
    service: UIConfigService = Depends(get_ui_config_service)
):
    """Returns the current active UI configuration (Theme + Language)."""
    # TODO: Extract user_id from auth token
    user_id = None 
    return service.get_config(user_id=user_id)

@router.post("/config")
async def update_ui_config(
    request: UpdateUIConfigRequest,
    service: UIConfigService = Depends(get_ui_config_service)
):
    """
    Updates the active UI theme and/or language.
    """
    try:
        # TODO: Extract user_id from auth token
        user_id = None
        
        # Update theme if provided
        if request.theme:
            service.save_config(request.theme, user_id=user_id)
        
        # Update language if provided
        if request.language:
            service.save_language(request.language, user_id=user_id)
        
        # Return updated config
        config = service.get_config(user_id=user_id)
        return {
            "status": "success",
            "theme": config.theme,
            "language": config.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

