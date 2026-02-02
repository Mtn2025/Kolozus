from typing import List, Optional
from uuid import UUID
from domain.models import Product, ProductSection, Fragment, Idea, EditorialProfile
from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort

class Drafter:
    def __init__(self, repo: RepositoryPort, ai: AIProviderPort):
        self.repo = repo
        self.ai = ai

    async def draft_section(self, product: Product, section: ProductSection, level: int) -> str:
        """
        Main entry point for drafting a section.
        Orchestrates retrieval and generation based on intervention level.
        """
        # 1. Retrieve Context (The "Raw Material")
        # For now, we search by Section Title + Product Title
        query = f"{section.title} {product.title}"
        context_fragments = await self.repo.search_knowledge(query, space_id=product.space_id, limit=10)
        
        # 2. Retrieve Previous Context (for Flow)
        prev_section_content = ""
        if level >= 2:
            # TODO: logic to find previous section by order_index
            pass

        # 3. Retrieve Editorial Profile (for Voice)
        profile = None
        if product.editorial_profile_id:
             # TODO: fetch profile
             pass

        # 4. Generate Content based on Level
        if level == 0:
            return self._level_0_assembly(context_fragments)
        elif level == 1:
            return await self._level_1_clean(section, context_fragments)
        elif level == 2:
            return await self._level_2_flow(section, context_fragments, prev_section_content)
        elif level == 3:
            return await self._level_3_deep(section, context_fragments, profile)
        
        return "Invalid Level"

    def _level_0_assembly(self, fragments: List[any]) -> str:
        """Raw compilation of sources."""
        text = "<h3>Raw Knowledge Compilation</h3><ul>"
        for f in fragments:
             # handling SearchResult object vs Fragment object
             content = f.raw_text
             text += f"<li>{content} <small>({getattr(f, 'score', 0):.2f})</small></li>"
        text += "</ul>"
        return text

    async def _level_1_clean(self, section: ProductSection, fragments: List) -> str:
        prompt = f"""
        TASK: Write a clean, grammatically correct section for '{section.title}'.
        SOURCE MATERIAL:
        {self._format_context(fragments)}
        
        INSTRUCTIONS:
        - Use ONLY the source material.
        - Fix grammar and spelling.
        - Do not add new information.
        """
        return await self.ai.synthesize(context=self._format_context(fragments), prompt=prompt)

    async def _level_2_flow(self, section: ProductSection, fragments: List, prev_context: str) -> str:
        prompt = f"""
        TASK: Write a cohesive narrative for '{section.title}'.
        PREVIOUS CONTEXT:
        {prev_context}
        
        SOURCE MATERIAL:
        {self._format_context(fragments)}
        
        INSTRUCTIONS:
        - Ensure smooth transition from previous context.
        - Unify the voice.
        - Create a logical flow between points.
        """
        return await self.ai.synthesize(context=self._format_context(fragments), prompt=prompt)

    async def _level_3_deep(self, section: ProductSection, fragments: List, profile: Optional[EditorialProfile]) -> str:
        tone_instruction = f"Tone: {profile.tone}. Audience: {profile.audience}." if profile else "Professional tone."
        prompt = f"""
        TASK: Act as a professional ghostwriter. Write the section '{section.title}'.
        EDITORIAL GUIDELINES:
        {tone_instruction}
        
        SOURCE MATERIAL:
        {self._format_context(fragments)}
        
        INSTRUCTIONS:
        - Synthesize arguments powerfully.
        - Use rhetorical devices appropriate for the tone.
        - Structure paragraphs for maximum impact.
        """
        return await self.ai.synthesize(context=self._format_context(fragments), prompt=prompt)

    def _format_context(self, fragments: List) -> str:
        return "\n".join([f"- {f.raw_text}" for f in fragments])
