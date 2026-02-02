from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Index, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship, backref
from infrastructure.database import Base
import uuid
from datetime import datetime

class SpaceModel(Base):
    __tablename__ = "spaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(20), default="#cbd5e1")
    created_at = Column(DateTime, default=datetime.utcnow)

    fragments = relationship("FragmentModel", back_populates="space")
    ideas = relationship("IdeaModel", back_populates="space")


class FragmentModel(Base):
    __tablename__ = "fragments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_text = Column(Text, nullable=False)
    source = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    embedding = Column(Vector(1536))
    is_deleted = Column(Boolean, default=False)
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"))
    
    space = relationship("SpaceModel", back_populates="fragments")

class IdeaModel(Base):
    __tablename__ = "ideas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title_provisional = Column(Text)
    domain = Column(String(100))
    status = Column(String(50))  # germinal, tension, ajuste, maduración, consolidada, descartada
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Store the SemanticProfile as JSON
    semantic_profile = Column(JSONB, nullable=True)
    # Searchable Vector (Syncs with Profile Centroid)
    embedding = Column(Vector(1536))
    is_deleted = Column(Boolean, default=False)
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"))

    space = relationship("SpaceModel", back_populates="ideas")

    __table_args__ = (
        Index(
            'idx_ideas_embedding', 
            embedding, 
            postgresql_using='hnsw', 
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
    )

    # Relationships
    versions = relationship("IdeaVersionModel", back_populates="idea")
    # fragments relationship would be many-to-many, usually needing an association table

class IdeaVersionModel(Base):
    __tablename__ = "idea_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idea_id = Column(UUID(as_uuid=True), ForeignKey("ideas.id"))
    version_number = Column(Integer, nullable=False)
    stage = Column(String(50))
    synthesized_text = Column(Text)
    reasoning_log = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    idea = relationship("IdeaModel", back_populates="versions")

# Association Table for Idea <-> Fragment (Many-to-Many)
class IdeaFragmentModel(Base):
    __tablename__ = "idea_fragments"

    idea_id = Column(UUID(as_uuid=True), ForeignKey("ideas.id"), primary_key=True)
    fragment_id = Column(UUID(as_uuid=True), ForeignKey("fragments.id"), primary_key=True)

class DecisionLogModel(Base):
    __tablename__ = "decision_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fragment_id = Column(UUID(as_uuid=True), ForeignKey("fragments.id"), nullable=False)
    target_idea_id = Column(UUID(as_uuid=True), ForeignKey("ideas.id"), nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String(50), nullable=False)
    confidence = Column(Float)
    rule_id = Column(String(100))
    reasoning = Column(Text)
    
    # Store constraints or extra meta as JSON
    meta_data = Column(JSONB, nullable=True)

class EditorialProfileModel(Base):
    __tablename__ = "editorial_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    tone = Column(String(50)) # e.g., "Academic", "Inspirational"
    audience = Column(String(100))
    style_rules = Column(JSONB) # e.g., ["no passive voice", "short paragraphs"]
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    archetype = Column(String(50), default="non_fiction") 
    style_family = Column(String(50), default="classic_publisher")
    design_overrides = Column(JSONB, default={})
    status = Column(String(50), default="draft")
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"))
    editorial_profile_id = Column(UUID(as_uuid=True), ForeignKey("editorial_profiles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    sections = relationship("ProductSectionModel", back_populates="product", cascade="all, delete-orphan")

class ProductSectionModel(Base):
    __tablename__ = "product_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("product_sections.id"), nullable=True)
    title = Column(String(255))
    content = Column(Text)
    order_index = Column(Integer, default=0)
    intervention_level = Column(Integer, default=0) # 0=Raw, 1=Clean, 2=Flow, 3=Deep
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("ProductModel", back_populates="sections")
    subsections = relationship("ProductSectionModel", backref=backref('parent', remote_side=[id]))
