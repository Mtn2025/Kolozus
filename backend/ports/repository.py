from typing import List, Optional, Tuple, Any
from uuid import UUID
from abc import ABC, abstractmethod
from domain.models import Fragment, Idea, IdeaVersion, Product, ProductSection

class RepositoryPort(ABC):
    
    @abstractmethod
    async def save_fragment(self, fragment: Fragment) -> Fragment:
        pass

    @abstractmethod
    async def get_fragment(self, fragment_id: UUID) -> Optional[Fragment]:
        pass

    @abstractmethod
    def list_spaces(self) -> List[Any]: # using Any to avoid import circular dep, but ideally Space
        pass

    @abstractmethod
    def get_space(self, space_id: UUID) -> Optional[Any]:
        pass

    @abstractmethod
    def create_space(self, name: str, description: str = None, icon: str = None, color: str = None) -> Any:
        pass

    @abstractmethod
    def save_space(self, space: Any) -> Any:
        pass

    @abstractmethod
    def delete_space(self, space_id: UUID) -> bool:
        pass

    # --- PRODUCTS ---
    @abstractmethod
    def create_product(self, product: 'Product') -> 'Product':
        pass

    @abstractmethod
    def get_product(self, product_id: UUID) -> Optional['Product']:
        pass
    
    @abstractmethod
    def list_products(self, space_id: UUID) -> List['Product']:
        pass

    @abstractmethod
    def update_product_status(self, product_id: UUID, status: str) -> bool:
        pass

    @abstractmethod
    def delete_product(self, product_id: UUID) -> bool:
        pass

    @abstractmethod
    def add_section(self, section: 'ProductSection') -> 'ProductSection':
        pass
        
    @abstractmethod
    def get_section(self, section_id: UUID) -> Optional['ProductSection']:
        pass

    @abstractmethod
    def update_product(self, product: Product) -> Product:
        pass

    @abstractmethod
    def update_section_content(self, section_id: UUID, content: str, level: int) -> bool:
        pass
    
    @abstractmethod
    async def search_knowledge(self, query: str, space_id: UUID = None, limit: int = 10) -> List[Any]:
        pass

    # --- END PRODUCTS ---

    @abstractmethod
    async def list_fragments(self, limit: int = 50, offset: int = 0, space_id: Optional[UUID] = None) -> List[Fragment]:
        pass

    @abstractmethod
    async def list_fragments_by_idea(self, idea_id: UUID) -> List[Fragment]:
        """Returns fragments associated with an idea via decision ledger."""
        pass

    @abstractmethod
    async def save_idea(self, idea: Idea) -> Idea:
        pass

    @abstractmethod
    async def get_idea(self, idea_id: UUID) -> Optional[Idea]:
        pass
    
    @abstractmethod
    async def save_idea_version(self, version: IdeaVersion) -> IdeaVersion:
        pass

    @abstractmethod
    async def get_latest_version(self, idea_id: UUID) -> Optional[IdeaVersion]:
        pass

    @abstractmethod
    async def list_idea_versions(self, idea_id: UUID) -> List[IdeaVersion]:
        pass

    @abstractmethod
    async def list_ideas(self, status: Optional[str] = None, space_id: Optional[UUID] = None) -> List[Idea]:
        pass

    @abstractmethod
    async def search_candidates(self, vector: List[float], limit: int = 5, space_id: Optional[UUID] = None) -> List[Tuple[Idea, float]]:
        """Returns ideas and their similarity score (0-1)."""
        pass

    @abstractmethod
    async def soft_delete_fragment(self, fragment_id: UUID) -> bool:
        pass

    @abstractmethod
    async def restore_fragment(self, fragment_id: UUID) -> bool:
        pass

    @abstractmethod
    async def hard_delete_fragment(self, fragment_id: UUID) -> bool:
        pass

    @abstractmethod
    async def list_deleted_fragments(self) -> List[Fragment]:
        pass

    @abstractmethod
    async def soft_delete_batch_fragments(self, ids: List[UUID]) -> int:
        pass
