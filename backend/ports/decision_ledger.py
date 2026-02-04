from abc import ABC, abstractmethod
from typing import Protocol
from domain.events import DecisionResult
from domain.models import Fragment
import json

class DecisionLedgerPort(ABC):
    @abstractmethod
    async def record_decision(self, fragment: Fragment, decision: DecisionResult):
        pass

    @abstractmethod
    async def get_recent_logs(self, limit: int = 50) -> list:
        pass

    @abstractmethod
    async def get_decision_history(self, fragment_id) -> list:
        pass

class InMemoryDecisionLedger(DecisionLedgerPort):
    def __init__(self):
        self._ledger = []

    async def record_decision(self, fragment: Fragment, decision: DecisionResult):
        entry = {
            "fragment_id": str(fragment.id),
            "timestamp": decision.action, # simplified for now
            "decision": decision.model_dump(),
            "fragment_preview": fragment.raw_text[:50]
        }
        self._ledger.append(entry)
        # In a real app, this would log to a file or audit table
        print(f"[LEDGER] Decision recorded: {json.dumps(entry, default=str)}")
