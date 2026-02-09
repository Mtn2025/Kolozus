from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import Dict, Optional, Any
from uuid import UUID
from pydantic import BaseModel
from domain.ai_models_sql import AISettings

# Reuse existing Pydantic models for internal typing
class AIModelConfig(BaseModel):
    provider: str
    model_name: str
    
class AIProfile(BaseModel):
    name: str
    blueprinter: AIModelConfig
    drafter: AIModelConfig
    summarizer: AIModelConfig
    embedding: AIModelConfig

DEFAULT_PROFILES = {
    "maestro": {
        "name": "maestro",
        "blueprinter": {"provider": "groq", "model_name": "llama-3.3-70b-versatile"},
        "drafter": {"provider": "groq", "model_name": "llama-3.3-70b-versatile"},
        "summarizer": {"provider": "groq", "model_name": "llama-3.1-8b-instant"},
        "embedding": {"provider": "ollama", "model_name": "nomic-embed-text-v2-moe:latest"}
    },
    "spark": {
        "name": "spark",
        "blueprinter": {"provider": "groq", "model_name": "llama-3.1-8b-instant"},
        "drafter": {"provider": "groq", "model_name": "llama-3.1-8b-instant"},
        "summarizer": {"provider": "groq", "model_name": "llama-3.1-8b-instant"},
        "embedding": {"provider": "ollama", "model_name": "nomic-embed-text-v2-moe:latest"}
    },
    "guardian": {
        "name": "guardian",
        "blueprinter": {"provider": "ollama", "model_name": "deepseek-r1:latest"},
        "drafter": {"provider": "ollama", "model_name": "llama3.3:latest"},
        "summarizer": {"provider": "ollama", "model_name": "llama3.2:1b"},
        "embedding": {"provider": "ollama", "model_name": "nomic-embed-text-v2-moe:latest"}
    }
}

class AIConfigService:
    def __init__(self, db: Session):
        self.db = db

    def get_config(self, user_id: Optional[UUID] = None) -> AIProfile:
        """
        Fetches the AI configuration for a specific user.
        If not found, returns the default 'Maestro' profile.
        """
        stmt = select(AISettings).where(AISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        # Default Logic
        if not settings:
            return AIProfile(**DEFAULT_PROFILES["maestro"])
            
        # Parse Profile
        profile_key = settings.profile_name
        
        if profile_key == "custom" and settings.custom_config:
            # Custom Profile from DB JSON
            # We assume custom_config matches the exact structure required
            # Robustness: merge with default to ensure all fields exist could be better,
            # but for now assume strict write validation.
            # Add 'name' to the dict for the Pydantic model
            config_data = settings.custom_config.copy()
            config_data["name"] = "custom"
            return AIProfile(**config_data)
            
        elif profile_key in DEFAULT_PROFILES:
            return AIProfile(**DEFAULT_PROFILES[profile_key])
            
        else:
             # Fallback for unknown profile name
             return AIProfile(**DEFAULT_PROFILES["maestro"])

    def save_config(self, profile_name: str, user_id: Optional[UUID] = None, custom_config: Optional[Dict] = None):
        """
        Upserts the AI configuration for a user.
        """
        # Validate input
        if profile_name not in DEFAULT_PROFILES and profile_name != "custom":
             raise ValueError(f"Invalid profile: {profile_name}")
             
        stmt = select(AISettings).where(AISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = AISettings(user_id=user_id)
            self.db.add(settings)
            
        settings.profile_name = profile_name
        if profile_name == "custom":
             settings.custom_config = custom_config
        else:
             settings.custom_config = None # Clear custom config if switching to standard
             
        self.db.commit()
        self.db.refresh(settings)
