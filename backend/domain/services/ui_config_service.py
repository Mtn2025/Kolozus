from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from domain.ui_models_sql import UISettings

class UIConfig(BaseModel):
    theme: str

class UIConfigService:
    def __init__(self, db: Session):
        self.db = db

    def get_config(self, user_id: Optional[UUID] = None) -> UIConfig:
        """
        Fetches the UI configuration (theme) for a specific user.
        If not found, returns the default 'evo' theme.
        """
        stmt = select(UISettings).where(UISettings.user_id == user_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            return UIConfig(theme="evo")
            
        return UIConfig(theme=settings.theme)

    def save_config(self, theme: str, user_id: Optional[UUID] = None):
        """
        Upserts the UI configuration for a user.
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
