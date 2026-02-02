from uuid import UUID, uuid4
from enum import Enum
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class CognitiveAction(str, Enum):
    ATTACH = "ATTACH"
    CREATE_NEW = "CREATE_NEW"
    MERGE_PROPOSAL = "MERGE_PROPOSAL"
    LINK_WEAK = "LINK_WEAK"
    BLOCK = "BLOCK"

class DomainEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    name: str
    payload: Dict[str, Any]

class DecisionResult(BaseModel):
    action: CognitiveAction
    target_idea_id: Optional[UUID] = None
    confidence: float
    reasoning: str
    rule_id: str  # Traceability: Which rule triggered this?
    constraints: List[str] = []

# Specific Events
class FragmentIngested(DomainEvent):
    name: str = "FragmentIngested"

class IdeaCreated(DomainEvent):
    name: str = "IdeaCreated"

class FragmentAttached(DomainEvent):
    name: str = "FragmentAttached"

class TensionDetected(DomainEvent):
    name: str = "TensionDetected"
