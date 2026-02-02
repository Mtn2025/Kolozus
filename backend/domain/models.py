from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List, Any, Dict
from enum import Enum, IntEnum
from pydantic import BaseModel, Field, ConfigDict

class InterventionLevel(IntEnum):
    RAW = 0
    CLEAN = 1
    FLOW = 2
    DEEP = 3

# We can't import SemanticProfile directly if it creates circular deps,
# but models.py is usually low level.
# For now, we assume implicit typing or simple import if semantic.py doesn't import models.
from .semantic import SemanticProfile

# Using Pydantic for Domain Models for simplicity and validation

class Space(BaseModel):
    id: UUID = uuid4()
    name: str
    description: Optional[str] = None
    color: str = "#cbd5e1"
    created_at: datetime = datetime.now()

    model_config = ConfigDict(from_attributes=True)

class Fragment(BaseModel):
    id: UUID = uuid4()
    raw_text: str
    source: Optional[str] = None
    created_at: datetime = datetime.now()
    embedding: Optional[List[float]] = None
    space_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)

class Idea(BaseModel):
    id: UUID = uuid4()
    title_provisional: Optional[str] = None
    domain: Optional[str] = None
    status: str = "germinal"  # Enum: germinal, tension, ajuste, maduración, consolidada, descartada
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    
    # Domain Logic: The Idea's semantic center
    semantic_profile: Optional['SemanticProfile'] = None  # Forward ref or object
    space_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)

class IdeaVersion(BaseModel):
    id: UUID = uuid4()
    idea_id: UUID
    version_number: int
    stage: str
    synthesized_text: Optional[str] = None
    reasoning_log: Optional[str] = None
    created_at: datetime = datetime.now()

    model_config = ConfigDict(from_attributes=True)

class EditorialProfile(BaseModel):
    id: UUID = uuid4()
    name: str
    tone: Optional[str] = None
    audience: Optional[str] = None
    style_rules: Optional[List[str]] = None
    space_id: Optional[UUID] = None
    created_at: datetime = datetime.now()

    model_config = ConfigDict(from_attributes=True)

class ProductSection(BaseModel):
    id: UUID = uuid4()
    product_id: UUID
    parent_id: Optional[UUID] = None
    title: Optional[str] = None
    content: Optional[str] = None
    order_index: int = 0
    intervention_level: int = 0
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    subsections: List['ProductSection'] = [] 

    model_config = ConfigDict(from_attributes=True)

class Archetype(str, Enum):
    # Editorial
    NON_FICTION = "non_fiction"
    ESSAY_ANTHOLOGY = "essay_anthology" 
    FICTION = "fiction"
    # Academic
    THESIS = "thesis"
    SCIENTIFIC_PAPER = "scientific_paper"
    TEXTBOOK = "textbook"
    # Business
    WHITE_PAPER = "white_paper"
    SOP_MANUAL = "sop_manual"
    CASE_STUDY = "case_study"
    # Digital
    ONLINE_COURSE = "online_course"
    BLOG_SERIES = "blog_series"
    NEWSLETTER = "newsletter"
    # Technical
    TECH_DOCS = "tech_docs"
    PRODUCT_ROADMAP = "product_roadmap"
    # Oral
    KEYNOTE = "keynote"

class StyleFamily(str, Enum):
    ACADEMIC_RIGOR = "academic_rigor"
    MODERN_STARTUP = "modern_startup"
    CLASSIC_PUBLISHER = "classic_publisher"
    SWISS_GRID = "swiss_grid"
    SCREEN_FLOW = "screen_flow"

class Product(BaseModel):
    id: UUID = uuid4()
    title: str
    archetype: Archetype = Archetype.NON_FICTION
    style_family: StyleFamily = StyleFamily.CLASSIC_PUBLISHER
    design_overrides: Dict[str, Any] = {}
    status: str = "draft"
    space_id: UUID
    editorial_profile_id: Optional[UUID] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    sections: List[ProductSection] = []

    model_config = ConfigDict(from_attributes=True)

Product.model_rebuild()
ProductSection.model_rebuild()
