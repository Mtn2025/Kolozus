from typing import List, Optional, Tuple
from uuid import UUID, uuid4, uuid5, NAMESPACE_OID
from datetime import datetime
from i18n import t

from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort
from ports.decision_ledger import DecisionLedgerPort
from domain.engine import CognitiveEngine
from domain.models import Fragment, Idea, IdeaVersion
from domain.events import DecisionResult, CognitiveAction
from domain.exceptions import NetworkError, EmbeddingError, DatabaseError, ModelError

class CognitivePipeline:


    def __init__(
        self,
        repository: RepositoryPort,
        engine: CognitiveEngine,
        ai_provider: AIProviderPort,
        ledger: DecisionLedgerPort
    ):
        self.repo = repository
        self.engine = engine
        self.ai = ai_provider
        self.ledger = ledger

    async def process_text(self, text: str, source: str = "manual", mode: str = "default", space_id: Optional[str] = None, language: str = "en") -> DecisionResult:
        # 1. Create Raw Fragment (Deterministic ID)
        f_id = uuid5(NAMESPACE_OID, text)
        
        # Parse UUID if string
        sid = None
        if space_id:
             try:
                 sid = UUID(space_id)
             except:
                 pass # Fallback to None if invalid UUID

        fragment = Fragment(
            id=f_id,
            raw_text=text,
            source=source,
            created_at=datetime.utcnow(),
            space_id=sid,
            language=language
        )
        
        # 2. Enrich (Embedding)
        try:
            fragment.embedding = await self.ai.generate_embedding(text)
        except Exception as e:
            if "connect" in str(e).lower():
                raise NetworkError("Failed to connect to AI Provider for embedding", original_error=str(e))
            raise EmbeddingError("Failed during embedding generation", original_error=str(e))
        
        # 3. Retrieve Candidates (Vector Search)
        # Returns List[Tuple[Idea, float]]
        try:
            if fragment.embedding:
                # STRICT FILTER: Only search candidates within the same space
                candidates_with_score = await self.repo.search_candidates(fragment.embedding, limit=5, space_id=sid)
            else:
                candidates_with_score = []
        except Exception as e:
             raise DatabaseError("Failed to search candidates in vector DB", original_error=str(e))
        
        # 4. Decide
        try:
            decision = self.engine.decide_fragment_destination(fragment, candidates_with_score, mode=mode)
        except Exception as e:
             # Logic error in engine?
             raise ModelError("Cognitive Engine decision failed", original_error=str(e))
        
        # --- ENRICH METADATA (Cognitive Gate) ---
        decision.constraints.append(f"engine_v:{self.engine.ENGINE_VERSION}")
        decision.constraints.append(f"rules_v:{self.engine.RULE_SET_VERSION}")
        
        provider_name = self.ai.__class__.__name__
        decision.constraints.append(f"emb_provider:{provider_name}")
        decision.constraints.append("emb_model:mock-fixed-dim" if "Mock" in provider_name else "emb_model:ollama-nomic")
        decision.constraints.append("prompt_hash:mock-hash-123") 
        
        # 5. Execute Action
        if decision.action == CognitiveAction.CREATE_NEW:
            # Create new Idea from Fragment
            start_vector = fragment.embedding
            if not start_vector:
                start_vector = [0.0] * 1536 

            # Initialize Domain Semantic Profile
            from domain.semantic import SemanticProfile
            
            initial_profile = SemanticProfile(centroid=start_vector, fragment_count=1)

            try:
                new_title = await self.ai.synthesize(text, "provisional_title", language=language)
            except Exception as e:
                if "connect" in str(e).lower():
                     raise NetworkError("Failed to connect to AI Provider for synthesis", original_error=str(e))
                raise ModelError("Failed to synthesize title", original_error=str(e))
             
            # Deterministic Idea ID based on Creator Fragment
            idea_id = uuid5(NAMESPACE_OID, f"IDEA:{f_id}")
             
            new_idea = Idea(
                id=idea_id,
                title_provisional=new_title,
                domain="Unclassified",
                status="germinal",
                created_at=datetime.utcnow(),
                semantic_profile=initial_profile,
                space_id=sid,
                language=language
            )
            
            try:
                # Save Idea first
                await self.repo.save_idea(new_idea)
                await self.repo.save_fragment(fragment)
                
                # Create Initial Version
                initial_version = IdeaVersion(
                    id=uuid4(),
                    idea_id=new_idea.id,
                    version_number=1,
                    stage="germinal",
                    synthesized_text=f"Initial seed: {text}",
                    reasoning_log="Genesis from single fragment",
                    created_at=datetime.utcnow(),
                    language=language
                )
                await self.repo.save_idea_version(initial_version)
                 
                # Log decision with target
                decision.target_idea_id = new_idea.id
                await self.ledger.record_decision(fragment, decision)
            except Exception as e:
                raise DatabaseError("Failed to persist new Idea chain", original_error=str(e))

            
        elif decision.action == CognitiveAction.ATTACH:
            try:
                # 1. Retrieve Target Idea
                target_idea = await self.repo.get_idea(decision.target_idea_id)
                if not target_idea:
                    # Logic error/Data integrity
                    raise DatabaseError(f"Target Idea {decision.target_idea_id} not found during ATTACH", original_error="ID mismatch")

                # 2. Save Fragment
                await self.repo.save_fragment(fragment)
                
                # --- SEMANTIC UPDATE ---
                # Recalculate Centroid
                if target_idea.semantic_profile and fragment.embedding:
                    target_idea.semantic_profile = target_idea.semantic_profile.update(fragment.embedding)
                    # Save updated idea (with new profile)
                    await self.repo.save_idea(target_idea)
            except Exception as e:
                 raise DatabaseError("Failed DB operations during ATTACH phase", original_error=str(e))
                
            # 3. Evolution Logic: Create new Version
            # Get latest version number
            try:
                latest_v = await self.repo.get_latest_version(target_idea.id)
                current_ver_num = latest_v.version_number if latest_v else 0
                new_version_num = current_ver_num + 1
            except Exception as e:
                 raise DatabaseError("Failed to fetch latest version", original_error=str(e))
            
            # Synthesis of new state
            try:
                synthesis = await self.ai.synthesize(text, f"integrate_into:{target_idea.title_provisional}", language=language)
            except Exception as e:
                 if "connect" in str(e).lower():
                      raise NetworkError("AI Provider synthesis connection failed", original_error=str(e))
                 raise ModelError("Synthesis of new version failed", original_error=str(e))
            
            new_version = IdeaVersion(
                 id=uuid4(),
                 idea_id=target_idea.id,
                 version_number=new_version_num,
                 stage=target_idea.status, # Stays same unless trigger
                 synthesized_text=synthesis,
                 reasoning_log=f"Attached fragment: {text[:30]}...",
                 created_at=datetime.utcnow(),
                 language=language
            )
            
            try:
                await self.repo.save_idea_version(new_version)
                
                # 4. Check for State Transition (Evolution)
                # Ask Engine if this update triggers a phase change
                transition_event = self.engine.detect_evolution_triggers(target_idea, new_version)
                if transition_event:
                    # Execute Transition
                    target_idea.status = transition_event.payload["new_phase"]
                    target_idea.updated_at = datetime.utcnow()
                    await self.repo.save_idea(target_idea)
                    
                    # Log usage of transition
                    decision.reasoning += f" [Transitioned to {target_idea.status}]"
                
                await self.ledger.record_decision(fragment, decision)
            except Exception as e:
                 raise DatabaseError("Failed to save evolution/version", original_error=str(e))
            
        return decision

    async def generate_blueprint(self, product, language: str = "en"):
        """
        Generate a blueprint (table of contents with structure) for a product
        using AI to analyze mature ideas in the product's space.
        
        Args:
            product: Product model instance with archetype, audience, space_id
            language: Target language for the blueprint
            
        Returns:
            dict: Blueprint structure with chapters and sections
        """
        from domain.services.maturity_calculator import MaturityCalculator
        
        # 1. Get all ideas from the product's space
        ideas = await self.repo.list_ideas(space_id=product.space_id)
        
        if not ideas:
            raise ModelError("No ideas available in this space to generate blueprint")
        
        # 2. Filter mature ideas (score > 50)
        mature_ideas = []
        for idea in ideas:
            fragments = await self.repo.list_fragments_by_idea(idea.id)
            versions = await self.repo.list_idea_versions(idea.id)
            score = MaturityCalculator.calculate(idea, fragments, len(versions))
            
            if score > 50:
                mature_ideas.append({
                    "id": str(idea.id),
                    "title": idea.title_provisional,
                    "domain": idea.domain,
                    "fragment_count": len(fragments),
                    "maturity_score": score
                })
        
        if not mature_ideas:
            raise ModelError("No mature ideas available (all scores < 50)")
        
        # 3. Build context for AI
        ideas_summary = "\n".join([
            f"- {idea['title']} (Domain: {idea['domain']}, Fragmentos: {idea['fragment_count']}, Madurez: {idea['maturity_score']}%)"
            for idea in mature_ideas
        ])
        
        # 4. Generate blueprint prompt
        prompt = f"""Eres un editor profesional experto. Analiza las siguientes ideas y crea una estructura editorial profesional.

PRODUCTO:
- Tipo: {product.archetype}
- Audiencia: {product.target_audience}
- Estilo: {product.style_family}
- Título: {product.title}

IDEAS DISPONIBLES:
{ideas_summary}

TAREA:
Genera una estructura editorial completa en formato JSON con:
- Título sugerido para el documento
- Capítulos principales (3-7 capítulos)
- Secciones dentro de cada capítulo
- Para cada sección, indica qué ideas (por título) deberían usarse

FORMATO JSON:
{{
  "title": "Título del Documento",
  "chapters": [
    {{
      "title": "Título del Capítulo 1",
      "order": 1,
      "sections": [
        {{
          "title": "Título de Sección 1.1",
          "order": 1,
          "source_ideas": ["Título Idea 1", "Título Idea 2"]
        }}
      ]
    }}
  ]
}}

Responde ÚNICAMENTE con el JSON, sin explicaciones adicionales."""

        try:
            # 5. Call AI to generate blueprint
            blueprint_json = await self.ai.synthesize(
                context=prompt,
                prompt="generate_blueprint",
                language=language
            )
            
            # 6. Parse JSON response
            import json
            import re
            
            # Extract JSON from potential markdown code block
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', blueprint_json, re.DOTALL)
            if json_match:
                blueprint_json = json_match.group(1)
            
            blueprint = json.loads(blueprint_json)
            
            # 7. Map source_ideas titles to IDs
            idea_title_to_id = {idea['title']: idea['id'] for idea in mature_ideas}
            
            for chapter in blueprint.get('chapters', []):
                for section in chapter.get('sections', []):
                    source_titles = section.get('source_ideas', [])
                    section['source_idea_ids'] = [
                        idea_title_to_id.get(title) 
                        for title in source_titles 
                        if title in idea_title_to_id
                    ]
            
            return blueprint
            
        except json.JSONDecodeError as e:
            raise ModelError(f"AI generated invalid JSON: {str(e)}")
        except Exception as e:
            if "connect" in str(e).lower():
                raise NetworkError("Failed to connect to AI Provider for blueprint", original_error=str(e))
            raise ModelError(f"Blueprint generation failed: {str(e)}")

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
