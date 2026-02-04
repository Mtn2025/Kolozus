from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from uuid import UUID
from infrastructure.dependencies import get_ledger, get_repository, get_cognitive_engine
from ports.decision_ledger import DecisionLedgerPort
from ports.repository import RepositoryPort
from domain.engine import CognitiveEngine

router = APIRouter(
    prefix="/audit",
    tags=["audit"],
    responses={404: {"description": "Not found"}},
)

@router.get("/fragment/{fragment_id}", response_model=List[Dict[str, Any]])
async def get_fragment_history(
    fragment_id: UUID,
    ledger: DecisionLedgerPort = Depends(get_ledger)
):
    """
    Retrieve the full cognitive history of a specific fragment.
    Includes timestamps, actions, reasoning, and version metadata.
    """
    history = await ledger.get_decision_history(fragment_id)
    if not history:
        raise HTTPException(status_code=404, detail="No history found for this fragment")
    return history

@router.get("/logs", response_model=List[Dict[str, Any]])
async def get_recent_audit_logs(
    limit: int = 50,
    ledger: DecisionLedgerPort = Depends(get_ledger)
):
    """
    Get the most recent system-wide decision logs.
    """
    return await ledger.get_recent_logs(limit)

@router.post("/replay/{fragment_id}")
async def replay_decision(
    fragment_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    engine: CognitiveEngine = Depends(get_cognitive_engine),
    ledger: DecisionLedgerPort = Depends(get_ledger)
):
    """
    Simulate the cognitive decision for an existing fragment using the CURRENT engine rules.
    Compares the result with the original historical decision to detect drift.
    """
    # 1. Get Fragment
    fragment = await repo.get_fragment(fragment_id)
    if not fragment:
        raise HTTPException(status_code=404, detail="Fragment not found")
        
    if not fragment.embedding:
         raise HTTPException(status_code=400, detail="Fragment has no embedding, cannot replay.")

    # 2. Re-run Search (Current State of Knowledge)
    candidates = await repo.search_candidates(fragment.embedding, limit=5)
    
    # 3. Ask Engine for Decision (Simulation)
    new_decision = engine.decide_fragment_destination(fragment, candidates)
    
    # 4. Fetch Original Decision (for comparison)
    history = await ledger.get_decision_history(fragment_id)
    original_decision = history[0] if history else None # Assuming first is creation/ingestion
    
    # 5. Calculate Drift
    drift_detected = False
    drift_reason = None
    
    if original_decision:
        # Compare Actions
        if original_decision["action"] != new_decision.action:
            drift_detected = True
            drift_reason = f"Action changed from {original_decision['action']} to {new_decision.action}"
        # Compare Targets (if attach)
        elif new_decision.action == "ATTACH" and original_decision.get("target_idea_id") != new_decision.target_idea_id:
             drift_detected = True
             drift_reason = f"Target changed from {original_decision.get('target_idea_id')} to {new_decision.target_idea_id}"
    
    return {
        "fragment_id": fragment.id,
        "engine_version": engine.ENGINE_VERSION,
        "rules_version": engine.RULE_SET_VERSION,
        "original_decision_summary": {
            "action": original_decision["action"] if original_decision else "UNKNOWN",
            "target": original_decision.get("target_idea_id"),
            "confidence": original_decision.get("confidence")
        } if original_decision else None,
        "replay_decision": {
            "action": new_decision.action,
            "target": new_decision.target_idea_id,
            "confidence": new_decision.confidence,
            "reasoning": new_decision.reasoning,
            "rule_id": new_decision.rule_id
        },
        "drift_detected": drift_detected,
        "drift_reason": drift_reason
    }
