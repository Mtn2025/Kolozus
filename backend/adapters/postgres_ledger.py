from datetime import datetime
from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from domain.events import DecisionResult
from ports.decision_ledger import DecisionLedgerPort
from adapters.orm import DecisionLogModel

class PostgresDecisionLedger(DecisionLedgerPort):
    def __init__(self, db_session: Session):
        self.db = db_session

    async def record_decision(self, fragment, decision: DecisionResult):
        # fragment can be Fragment domain object, extract id
        f_id = fragment.id
        
        log_entry = DecisionLogModel(
            fragment_id=f_id,
            target_idea_id=decision.target_idea_id,
            action=decision.action.value,
            confidence=decision.confidence,
            rule_id=decision.rule_id,
            reasoning=decision.reasoning,
            meta_data={"constraints": decision.constraints},
            timestamp=datetime.utcnow()
        )
        self.db.add(log_entry)
        self.db.commit()

    async def get_decision_history(self, fragment_id: UUID) -> List[dict]:
        # For replayability/audit
        logs = self.db.query(DecisionLogModel).filter(
            DecisionLogModel.fragment_id == fragment_id
        ).all()
        
        return [
            {
                "timestamp": log.timestamp.isoformat(),
                "action": log.action,
                "target_idea_id": str(log.target_idea_id) if log.target_idea_id else None,
                "confidence": log.confidence,
                "reasoning": log.reasoning,
                "meta": log.meta_data # Return the stored JSON
            }
            for log in logs
        ]
