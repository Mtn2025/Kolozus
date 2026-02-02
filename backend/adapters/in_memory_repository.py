from typing import List, Optional, Dict, Tuple
from uuid import UUID
from domain.models import Fragment, Idea, IdeaVersion
from ports.repository import RepositoryPort

class InMemoryRepository(RepositoryPort):
    def __init__(self):
        self.fragments = {}
        self.ideas = {}
        self.versions = {}

    async def save_fragment(self, fragment: Fragment) -> Fragment:
        self.fragments[fragment.id] = fragment
        return fragment

    async def get_fragment(self, fragment_id: UUID) -> Optional[Fragment]:
        return self.fragments.get(fragment_id)

    async def save_idea(self, idea: Idea) -> Idea:
        self.ideas[idea.id] = idea
        return idea

    async def get_idea(self, idea_id: UUID) -> Optional[Idea]:
        return self.ideas.get(idea_id)

    async def save_idea_version(self, version: IdeaVersion) -> IdeaVersion:
        self.versions[version.id] = version
        return version

    async def list_ideas(self, status: Optional[str] = None) -> List[Idea]:
        if status:
            return [i for i in self.ideas.values() if i.status == status]
        return list(self.ideas.values())

    async def get_latest_version(self, idea_id: UUID) -> Optional[IdeaVersion]:
        idea_versions = [v for v in self.versions.values() if v.idea_id == idea_id]
        if not idea_versions:
            return None
        return max(idea_versions, key=lambda v: v.version_number)

    async def list_idea_versions(self, idea_id: UUID) -> List[IdeaVersion]:
        return sorted(
            [v for v in self.versions.values() if v.idea_id == idea_id],
            key=lambda v: v.version_number
        )

    async def search_candidates(self, vector: List[float], limit: int = 5) -> List[Tuple[Idea, float]]:
        # Mock search: just return detailed list, with fake score
        # In real in-memory, we'd do dot product.
        results = list(self.ideas.values())[:limit]
        return [(idea, 0.95) for idea in results]
