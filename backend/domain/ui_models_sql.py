from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from infrastructure.database import Base
import uuid

class UISettings(Base):
    __tablename__ = "ui_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Allows system-wide default (user_id=None) or specific user override
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True) 
    
    theme = Column(String, default="evo")
    language = Column(String(5), default="es")  # ✅ Added language column (es/en)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
