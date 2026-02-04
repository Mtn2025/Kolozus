from uuid import uuid4, uuid5, NAMESPACE_OID
from typing import Optional
from domain.models import Fragment, Idea, IdeaVersion, Space
from domain.engine import CognitiveEngine
from domain.events import DecisionResult, CognitiveAction
from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort
from ports.decision_ledger import DecisionLedgerPort
from datetime import datetime
from domain.exceptions import EmbeddingError, ModelError, DatabaseError, NetworkError

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
                 sid = uuid5(NAMESPACE_OID, space_id) if len(space_id) < 32 else UUID(space_id) # Simplify, assume UUID string
                 # Actually, better to just expect valid UUID string or None from controller
                 # But for robustness let's just use UUID(space_id) if provided
                 import uuid
                 sid = uuid.UUID(space_id)
             except:
                 pass # Fallback to None (General) if invalid

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
