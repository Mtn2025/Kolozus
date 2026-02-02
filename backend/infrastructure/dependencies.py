from fastapi import Depends
from sqlalchemy.orm import Session
from infrastructure.database import get_db
from ports.repository import RepositoryPort
from ports.ai_provider import AIProviderPort
from ports.decision_ledger import DecisionLedgerPort
from adapters.postgres_repository import PostgresRepository
from adapters.postgres_ledger import PostgresDecisionLedger
from domain.engine import CognitiveEngine
from domain.services.pipeline import CognitivePipeline
from domain.services.ai_config_service import AIConfigService
from domain.services.ui_config_service import UIConfigService
from adapters.llm.composite_provider import CompositeAIProvider

def get_repository(db: Session = Depends(get_db)) -> RepositoryPort:
    return PostgresRepository(db)

def get_ai_config_service(db: Session = Depends(get_db)) -> AIConfigService:
    return AIConfigService(db)

def get_ui_config_service(db: Session = Depends(get_db)) -> UIConfigService:
    return UIConfigService(db)

def get_ai_provider(config_service: AIConfigService = Depends(get_ai_config_service)) -> AIProviderPort:
    # Standard request-scoped dependency injection
    return CompositeAIProvider(config_service)

def get_ledger(db: Session = Depends(get_db)) -> DecisionLedgerPort:
    return PostgresDecisionLedger(db)

def get_cognitive_engine(ai: AIProviderPort = Depends(get_ai_provider)) -> CognitiveEngine:
    return CognitiveEngine(ai_provider=ai)

def get_pipeline(
    repo: RepositoryPort = Depends(get_repository),
    ai: AIProviderPort = Depends(get_ai_provider),
    ledger: DecisionLedgerPort = Depends(get_ledger),
    engine: CognitiveEngine = Depends(get_cognitive_engine)
) -> CognitivePipeline:
    return CognitivePipeline(repo, engine, ai, ledger)
