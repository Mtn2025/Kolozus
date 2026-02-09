from typing import List, Optional, Tuple, Any
from uuid import UUID
from domain.models import Fragment, Idea
from domain.events import DecisionResult, CognitiveAction, TensionDetected, DomainEvent
from ports.ai_provider import AIProviderPort

class CognitiveEngine:
    ENGINE_VERSION = "1.0.0-alpha"
    RULE_SET_VERSION = "2026.01.30-determ"

    def __init__(self, ai_provider: Optional[AIProviderPort] = None):
        # AI Provider is optional here; if None, acts with pure logic/mocks
        self.ai_provider = ai_provider

    def decide_fragment_destination(
        self, 
        fragment: Fragment, 
        candidates_with_score: List[Tuple[Idea, float]],
        mode: str = "default" # default, explorer, consolidator
    ) -> DecisionResult:
        """
        Pure function: Given a fragment and a list of (candidate, score),
        decide what to do. No side effects.
        """
        
        # Threshold Configuration based on Mode
        if mode == "explorer":
            # High barrier for attachment, encourages new ideas
            ATTACH_THRESHOLD = 0.85
            AMBIGUITY_THRESHOLD = 0.75
        elif mode == "consolidator":
            # Low barrier, encourages grouping
            ATTACH_THRESHOLD = 0.60
            AMBIGUITY_THRESHOLD = 0.45
        else:
            # Balanced - DEFAULT MODE
            ATTACH_THRESHOLD = 0.70
            AMBIGUITY_THRESHOLD = 0.55
        
        # 1. Hard Rule: Empty candidates -> Create New
        if not candidates_with_score:
            return DecisionResult(
                action=CognitiveAction.CREATE_NEW,
                confidence=1.0,
                reasoning="No candidates provided. Must create new idea.",
                rule_id="RULE_INIT_001"
            )

        # 2. Heuristic: Check for best match
        best_candidate, best_score = candidates_with_score[0]
        
        # 3. Decision Logic
        if best_score > ATTACH_THRESHOLD:
             return DecisionResult(
                action=CognitiveAction.ATTACH,
                target_idea_id=best_candidate.id,
                confidence=best_score,
                reasoning=f"High similarity ({best_score:.4f} > {ATTACH_THRESHOLD}) with idea '{best_candidate.title_provisional}' [{mode.upper()}]",
                rule_id=f"HEUR_ATTACH_{mode.upper()}"
            )
        
        elif best_score > AMBIGUITY_THRESHOLD:
             # Ambiguity - lowered threshold slightly for stress test visibility
             return DecisionResult(
                action=CognitiveAction.MERGE_PROPOSAL, # Or ask user
                target_idea_id=best_candidate.id,
                confidence=best_score,
                reasoning=f"Ambiguous match ({best_score:.4f}). Potential Merge.",
                rule_id="HEUR_AMBIGUITY_CHECK"
            )
            
        return DecisionResult(
            action=CognitiveAction.CREATE_NEW,
            confidence=1.0,
            reasoning=f"No candidate met {mode} threshold (Best: {best_score:.4f}).",
            rule_id=f"RULE_NEW_{mode.upper()}"
        )

    def detect_evolution_triggers(self, idea: Idea, latest_version: Any) -> Optional[DomainEvent]:
        """
        Pure function: Check if the Idea should change phase based on new version.
        """
        # Heuristic 1: Genesis -> Exploration
        # If we have > 2 updates/versions, move to Exploration
        if idea.status == "germinal" and latest_version.version_number >= 3:
             return DomainEvent(
                 name="PhaseChanged",
                 payload={
                     "idea_id": str(idea.id),
                     "old_phase": "germinal",
                     "new_phase": "exploration",
                     "reason": "Density reached (3+ versions)"
                 }
             )
        
        # Heuristic 2: Tension
        # If synthesis contains "BUT" or "HOWEVER" (Mock logic for contradiction)
        if "BUT" in latest_version.synthesized_text:
             return DomainEvent(
                 name="TensionDetected",
                 payload={
                     "idea_id": str(idea.id),
                     "old_phase": idea.status,
                     "new_phase": "tension",
                     "reason": "Contradiction detected in synthesis"
                 }
             )
             
        return None
