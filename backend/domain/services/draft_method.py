    async def generate_section_draft(self, section_title: str, source_idea_ids: List, product, language: str = "en"):
        """
        Generate a draft (written content) for a specific section using source ideas.
        
        Args:
            section_title: Title of the section to write
            source_idea_ids: List of UUIDs of ideas to use as source material
            product: Product instance with archetype, audience, style
            language: Target language
            
        Returns:
            str: Generated draft content
        """
        # 1. Retrieve full content from source ideas
        source_contents = []
        for idea_id in source_idea_ids:
            if not idea_id:
                continue
                
            try:
                from uuid import UUID
                idea_id_uuid = UUID(idea_id) if isinstance(idea_id, str) else idea_id
                
                # Get idea and its fragments
                idea = await self.repo.get_idea(idea_id_uuid)
                if not idea:
                    continue
                    
                fragments = await self.repo.list_fragments_by_idea(idea_id_uuid)
                versions = await self.repo.list_idea_versions(idea_id_uuid)
                
                # Use latest version if available, otherwise fragments
                if versions:
                    latest_version = max(versions, key=lambda v: v.version_number)
                    content = latest_version.synthesized_text
                else:
                    content = "\n".join([f.raw_text for f in fragments])
                
                source_contents.append({
                    "title": idea.title_provisional,
                    "content": content
                })
            except Exception as e:
                print(f"Error loading idea {idea_id}: {e}")
                continue
        
        if not source_contents:
            raise ModelError("No valid source ideas could be loaded for draft generation")
        
        # 2. Build context from sources
        sources_text = "\n\n---\n\n".join([
            f"**{src['title']}**\n{src['content']}"
            for src in source_contents
        ])
        
        # 3. Generate draft prompt
        prompt = f"""Eres un escritor profesional especializado en {product.archetype}.

AUDIENCIA: {product.target_audience}
ESTILO: {product.style_family}

SECCIÓN A ESCRIBIR: "{section_title}"

MATERIAL DE REFERENCIA:
{sources_text}

TAREA:
Escribe un borrador completo y profesional para la sección "{section_title}".

INSTRUCCIONES:
- Usa el material de referencia como base de contenido
- Adapta el tono y estilo para la audiencia objetivo
- Escribe 300-600 palabras
- Estructura con párrafos claros
- Incluye ejemplos o casos prácticos si es apropiado
- NO uses markdown headers (###), solo texto con párrafos
- Escribe en {language}

BORRADOR:"""

        try:
            # 4. Generate draft
            draft_content = await self.ai.synthesize(
                context=prompt,
                prompt="generate_section_draft",
                language=language
            )
            
            return draft_content.strip()
            
        except Exception as e:
            if "connect" in str(e).lower():
                raise NetworkError("Failed to connect to AI Provider for draft", original_error=str(e))
            raise ModelError(f"Draft generation failed: {str(e)}")
