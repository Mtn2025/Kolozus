from sqlalchemy import Column, String, JSON, DateTime, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from infrastructure.database import Base
import uuid

class AISettings(Base):
    __tablename__ = "ai_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Allows system-wide default (user_id=None) or specific user override
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True) 
    
    profile_name = Column(String, default="maestro")
    
    # Stores the specific model overrides if profile is 'custom'
    # Structure: { "blueprinter": {...}, "drafter": {...} }
    custom_config = Column(JSON, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
