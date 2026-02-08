from typing import List, Dict, Any
from uuid import UUID
import uuid
from domain.models import Product, ProductSection, Fragment
from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort

class Blueprinter:
    def __init__(self, repo: RepositoryPort, ai: AIProviderPort):
        self.repo = repo
        self.ai = ai

    async def generate_structure(self, product_id: UUID) -> List[ProductSection]:
        product = self.repo.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
            
        space_id = product.space_id
        
        # ✅ FIX: Delete existing sections before regenerating
        # This prevents accumulation of duplicate sections on repeated calls
        existing_sections = product.sections
        for section in existing_sections:
            # Delete section and its subsections (cascade should handle this)
            self.repo.delete_section(section.id)
        
        # 1. Gather Context
        fragments = await self.repo.list_fragments(limit=50, space_id=space_id)
        context_text = "\n".join([f"- {f.raw_text}" for f in fragments])
        
        # 2. Prompt AI for Blueprint
        prompt = f"""
        You are an Expert Editorial Architect.
        
        PRODUCT TITLE: {product.title}
        ARCHETYPE: {product.archetype.value if hasattr(product.archetype, 'value') else product.archetype}
        
        TASK:
        Create a detailed structural blueprint (Book Outline / Course Syllabus) for this product based on the available Fragments.
        Group the fragments logically into Sections and Subsections.
        
        REQUIREMENTS:
        - Create 3-8 Main Sections.
        - Each Section should have 2-4 Subsections.
        - Titles must be professional and engaging.
        - Add a brief 'content' note for each subsection on what it should cover.
        
        OUTPUT FORMAT:
        JSON with a key "sections". Each section has "title", "content" (brief description), and optional "subsections" (list of same structure).
        """
        
        response_json = await self.ai.generate_json(context=context_text, prompt=prompt)
        
        # 3. Parse and Save Structure
        sections_data = response_json.get("sections", [])
        created_sections = []
        
        for idx, sec_data in enumerate(sections_data):
            # Create Main Section
            main_sec = ProductSection(
                id=uuid.uuid4(),
                product_id=product.id,
                title=sec_data.get("title", f"Section {idx+1}"),
                content=f"<p><em>{sec_data.get('content', '')}</em></p>", # Initial content is the description
                order_index=idx,
                intervention_level=0,
                subsections=[]
            )
            # Create sub-sections if any cannot be nested directly in model usually without saving parent first,
            # but for Repo we added 'add_section'.
            
            # Save Main Section
            self.repo.add_section(main_sec)
            created_sections.append(main_sec)
            
            # Handle Subsections
            subs = sec_data.get("subsections", [])
            for sub_idx, sub_data in enumerate(subs):
                sub_sec = ProductSection(
                    id=uuid.uuid4(),
                    product_id=product.id,
                    parent_id=main_sec.id,
                    title=sub_data.get("title", f"Subsection {sub_idx+1}"),
                    content=f"<p><em>{sub_data.get('content', '')}</em></p>",
                    order_index=sub_idx,
                    intervention_level=0
                )
                self.repo.add_section(sub_sec)
                # We don't need to append to main_sec.subsections manually if we re-fetch, 
                # but for return value we might want to.
                
        # Return fresh product with sections
        updated_product = self.repo.get_product(product_id)
        return updated_product.sections
