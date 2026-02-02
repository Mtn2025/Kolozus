from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, update
from domain.models import Fragment, Idea, IdeaVersion, Space, Product, ProductSection
from ports.repository import RepositoryPort
from adapters.orm import FragmentModel, IdeaModel, IdeaVersionModel, DecisionLogModel, SpaceModel, ProductModel, ProductSectionModel, EditorialProfileModel
import uuid
from datetime import datetime

class PostgresRepository(RepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    async def save_fragment(self, fragment: Fragment) -> Fragment:
        db_fragment = FragmentModel(
            id=fragment.id,
            raw_text=fragment.raw_text,
            source=fragment.source,
            created_at=fragment.created_at,
            embedding=fragment.embedding
        )
        self.db.add(db_fragment)
        self.db.commit()
        self.db.refresh(db_fragment)
        return fragment

    # --- SPACES ---
    def list_spaces(self) -> List[Space]:
        stmt = select(SpaceModel).order_by(SpaceModel.name)
        results = self.db.execute(stmt).scalars().all()
        return [Space.model_validate(r) for r in results]

    def get_space(self, space_id: UUID) -> Optional[Space]:
        stmt = select(SpaceModel).where(SpaceModel.id == space_id)
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            return Space.model_validate(result)
        return None

    def create_space(self, name: str, description: str = None) -> Space:
        space = SpaceModel(id=uuid.uuid4(), name=name, description=description)
        self.db.add(space)
        self.db.commit()
        self.db.refresh(space)
        return Space.model_validate(space)
    # --- END SPACES ---

    # --- PRODUCTS ---
    def create_product(self, product: Product) -> Product:
        db_product = ProductModel(
            id=product.id,
            title=product.title,
            archetype=product.archetype.value,
            style_family=product.style_family.value,
            status=product.status,
            space_id=product.space_id,
            editorial_profile_id=product.editorial_profile_id,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
        self.db.add(db_product)
        self.db.commit()
        return product

    def get_product(self, product_id: UUID) -> Optional[Product]:
        # Eager load sections for now (simplistic)
        stmt = select(ProductModel).where(ProductModel.id == product_id).options(selectinload(ProductModel.sections))
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            return Product.model_validate(result)
        return None
    
    def update_product(self, product: Product) -> Product:
        stmt = (
            update(ProductModel)
            .where(ProductModel.id == product.id)
            .values(
                title=product.title,
                archetype=product.archetype.value,
                style_family=product.style_family.value,
                design_overrides=product.design_overrides,
                status=product.status,
                updated_at=datetime.utcnow()
            )
        )
        self.db.execute(stmt)
        self.db.commit()
        return self.get_product(product.id)
    
    def list_products(self, space_id: UUID) -> List[Product]:
        stmt = select(ProductModel).where(ProductModel.space_id == space_id).order_by(ProductModel.updated_at.desc())
        results = self.db.execute(stmt).scalars().all()
        return [Product.model_validate(r) for r in results]

    def update_product_status(self, product_id: UUID, status: str) -> bool:
        stmt = update(ProductModel).where(ProductModel.id == product_id).values(status=status)
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount > 0

    def add_section(self, section: ProductSection) -> ProductSection:
        db_section = ProductSectionModel(
            id=section.id,
            product_id=section.product_id,
            parent_id=section.parent_id,
            title=section.title,
            content=section.content,
            order_index=section.order_index,
            intervention_level=section.intervention_level,
            created_at=section.created_at,
            updated_at=section.updated_at
        )
        self.db.add(db_section)
        self.db.commit()
        return section
        
    def get_section(self, section_id: UUID) -> Optional[ProductSection]:
        stmt = select(ProductSectionModel).where(ProductSectionModel.id == section_id)
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            return ProductSection.model_validate(result)
        return None

    def update_section_content(self, section_id: UUID, content: str, level: int) -> bool:
        stmt = update(ProductSectionModel).where(ProductSectionModel.id == section_id).values(
            content=content, 
            intervention_level=level,
            updated_at=datetime.utcnow()
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount > 0

    async def search_knowledge(self, query: str, space_id: UUID = None, limit: int = 10) -> List[Any]:
        # Using vector search logic similar to search_candidates but possibly using query embedding if available
        # checking if we have an embedding service here... 
        # Actually Repository usually doesn't generate embeddings.
        # It should receive the vector. 
        # For text search, we can use ILIKE for now as a fallback or if pg_trgm is enabled.
        # Assuming hybrid search is Phase 14, let's use Simple Like for now for the prototype
        stmt = select(FragmentModel).where(FragmentModel.raw_text.ilike(f"%{query}%"), FragmentModel.is_deleted == False)
        if space_id:
            stmt = stmt.where(FragmentModel.space_id == space_id)
        stmt = stmt.limit(limit)
        results = self.db.execute(stmt).scalars().all()
        # Mapping result to a simple object for consumption
        # Or return Fragments
        return [Fragment.model_validate(r) for r in results]

    # --- END PRODUCTS ---

    async def get_fragment(self, fragment_id: UUID) -> Optional[Fragment]:
        stmt = select(FragmentModel).where(FragmentModel.id == fragment_id, FragmentModel.is_deleted == False)
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            return Fragment.model_validate(result)
        return None

    async def list_fragments(self, limit: int = 50, offset: int = 0, space_id: Optional[UUID] = None) -> List[Fragment]:
        stmt = select(FragmentModel).where(FragmentModel.is_deleted == False)
        if space_id:
            stmt = stmt.where(FragmentModel.space_id == space_id)
        stmt = stmt.order_by(FragmentModel.created_at.desc()).limit(limit).offset(offset)
        results = self.db.execute(stmt).scalars().all()
        return [Fragment.model_validate(r) for r in results]

    async def list_fragments_by_idea(self, idea_id: UUID) -> List[Fragment]:
        # Join Fragments with DecisionLogs to find those attached to this Idea
        stmt = select(FragmentModel).join(DecisionLogModel, FragmentModel.id == DecisionLogModel.fragment_id)\
               .where(DecisionLogModel.target_idea_id == idea_id, FragmentModel.is_deleted == False)\
               .distinct()
        results = self.db.execute(stmt).scalars().all()
        return [Fragment.model_validate(r) for r in results]

    async def save_idea(self, idea: Idea) -> Idea:
        stmt = select(IdeaModel).where(IdeaModel.id == idea.id)
        existing = self.db.execute(stmt).scalar_one_or_none()
        
        # Serialize Profile
        profile_json = idea.semantic_profile.model_dump() if idea.semantic_profile else None
        
        # NOTE: For Vector Search to work on Idea level, we need a Vector Column on IdeaModel too.
        # But our Profile is JSON. 
        # Strategy: We sync the 'centroid' from profile to the 'embedding' column for index search.
        embedding_val = idea.semantic_profile.centroid if idea.semantic_profile else None
        
        if existing:
            existing.title_provisional = idea.title_provisional
            existing.domain = idea.domain
            existing.status = idea.status
            existing.updated_at = idea.updated_at
            existing.semantic_profile = profile_json
            existing.embedding = embedding_val # SYNCED
            
            self.db.commit()
            self.db.refresh(existing)
            return Idea.model_validate(existing)
        else:
            db_idea = IdeaModel(
                id=idea.id,
                title_provisional=idea.title_provisional,
                domain=idea.domain,
                status=idea.status,
                created_at=idea.created_at,
                updated_at=idea.updated_at,
                semantic_profile=profile_json,
                embedding=embedding_val # SYNCED
            )
            self.db.add(db_idea)
            self.db.commit()
            self.db.refresh(db_idea)
            return idea

    async def get_idea(self, idea_id: UUID) -> Optional[Idea]:
        stmt = select(IdeaModel).where(IdeaModel.id == idea_id, IdeaModel.is_deleted == False)
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            # Pydantic should auto-deserialize JSONB to SemanticProfile based on type hint in model
            return Idea.model_validate(result)
        return None

    async def save_idea_version(self, version: IdeaVersion) -> IdeaVersion:
        db_version = IdeaVersionModel(
            id=version.id,
            idea_id=version.idea_id,
            version_number=version.version_number,
            stage=version.stage,
            synthesized_text=version.synthesized_text,
            reasoning_log=version.reasoning_log,
            created_at=version.created_at
        )
        self.db.add(db_version)
        self.db.commit()
        self.db.refresh(db_version)
        return version

    async def list_ideas(self, status: Optional[str] = None, space_id: Optional[UUID] = None) -> List[Idea]:
        stmt = select(IdeaModel).where(IdeaModel.is_deleted == False)
        if status:
            stmt = stmt.where(IdeaModel.status == status)
        if space_id:
            stmt = stmt.where(IdeaModel.space_id == space_id)
        
        results = self.db.execute(stmt).scalars().all()
        return [Idea.model_validate(r) for r in results]

    async def get_latest_version(self, idea_id: UUID) -> Optional[IdeaVersion]:
        stmt = select(IdeaVersionModel)\
               .where(IdeaVersionModel.idea_id == idea_id)\
               .order_by(IdeaVersionModel.version_number.desc())\
               .limit(1)
        result = self.db.execute(stmt).scalar_one_or_none()
        if result:
            return IdeaVersion.model_validate(result)
        return None

    async def list_idea_versions(self, idea_id: UUID) -> List[IdeaVersion]:
        stmt = select(IdeaVersionModel)\
               .where(IdeaVersionModel.idea_id == idea_id)\
               .order_by(IdeaVersionModel.version_number.asc())
        results = self.db.execute(stmt).scalars().all()
        return [IdeaVersion.model_validate(r) for r in results]

    async def search_candidates(self, vector: List[float], limit: int = 5, space_id: Optional[UUID] = None) -> List[Tuple[Idea, float]]:
        # Using cosine distance <=>
        # dist = 1 - sim => sim = 1 - dist
        distance_expr = IdeaModel.embedding.cosine_distance(vector).label("distance")
        stmt = select(IdeaModel, distance_expr)\
               .where(IdeaModel.is_deleted == False)
        
        if space_id:
            stmt = stmt.where(IdeaModel.space_id == space_id)

        stmt = stmt.order_by(distance_expr).limit(limit)
        
        results = self.db.execute(stmt).all()
        # results is list of Row(IdeaModel, distance)
        
        candidates = []
        for row in results:
            idea_model = row[0]
            dist = row[1]
            sim = 1.0 - dist
            candidates.append((Idea.model_validate(idea_model), sim))
            
            sim = 1.0 - dist
            candidates.append((Idea.model_validate(idea_model), sim))
            
        return candidates

    # --- TRASH MANAGEMENT ---
    
    async def soft_delete_fragment(self, fragment_id: UUID) -> bool:
        stmt = select(FragmentModel).where(FragmentModel.id == fragment_id)
        fragment = self.db.execute(stmt).scalar_one_or_none()
        if fragment:
            fragment.is_deleted = True
            self.db.commit()
            return True
        return False
        
    async def restore_fragment(self, fragment_id: UUID) -> bool:
        stmt = select(FragmentModel).where(FragmentModel.id == fragment_id)
        fragment = self.db.execute(stmt).scalar_one_or_none()
        if fragment:
            fragment.is_deleted = False
            self.db.commit()
            return True
        return False

    async def hard_delete_fragment(self, fragment_id: UUID) -> bool:
        stmt = select(FragmentModel).where(FragmentModel.id == fragment_id)
        fragment = self.db.execute(stmt).scalar_one_or_none()
        if fragment:
            self.db.delete(fragment)
            self.db.commit()
            return True
        return False

    async def list_deleted_fragments(self) -> List[Fragment]:
        stmt = select(FragmentModel).where(FragmentModel.is_deleted == True).order_by(FragmentModel.created_at.desc())
        results = self.db.execute(stmt).scalars().all()
        return [Fragment.model_validate(r) for r in results]

    # Batch operations (can be optimized later with update/delete queries)
    async def soft_delete_batch_fragments(self, ids: List[UUID]) -> int:
        count = 0
        for fid in ids:
            if await self.soft_delete_fragment(fid):
                count += 1
        return count

