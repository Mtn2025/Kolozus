from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from domain.ui_models_sql import UISettings

class UIConfig(BaseModel):
    theme: str = "light"
    language: str = "es"  # ✅ Added language (default: Spanish)

class UIConfigService:
    def __init__(self, db: Session):
        self.db = db

    def get_config(self, user_id: Optional[UUID] = None) -> UIConfig:
        """
        Fetches the UI configuration (theme + language) for a specific user.
        If not found, returns the default config.
        """
        stmt = select(UISettings).where(UISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            return UIConfig(theme="light", language="es")
            
        return UIConfig(
            theme=settings.theme,
            language=settings.language if hasattr(settings, 'language') else "es"
        )

    def save_config(self, theme: str, user_id: Optional[UUID] = None):
        """
        Upserts the UI theme for a user.
        """
        stmt = select(UISettings).where(UISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = UISettings(user_id=user_id)
            self.db.add(settings)
            
        settings.theme = theme
        self.db.commit()
        self.db.refresh(settings)
    
    def save_language(self, language: str, user_id: Optional[UUID] = None):
        """
        Upserts the UI language for a user.
        """
        # Validate language
        if language not in ["es", "en"]:
            raise ValueError(f"Invalid language: {language}. Must be 'es' or 'en'")
        
        stmt = select(UISettings).where(UISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = UISettings(user_id=user_id)
            self.db.add(settings)
        
        # Add language field if it doesn't exist (for backward compatibility)
        if hasattr(settings, 'language'):
            settings.language = language
        else:
            # If DB doesn't have language column yet, just skip
            pass
        
        self.db.commit()
        self.db.refresh(settings)
