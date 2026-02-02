import asyncio
from infrastructure.dependencies import get_ai_provider, get_ledger, get_cognitive_engine
from infrastructure.database import SessionLocal, engine, Base
from adapters.postgres_repository import PostgresRepository
from domain.services.pipeline import CognitivePipeline
from domain.events import CognitiveAction
from sqlalchemy import text

async def run_simulation():
    print("--- Starting Cognitive Evolution Simulation ---")
    
    # 0. Initialize DB (Enable Vector + Create Tables)
    print("[Init] Setting up Database...")
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    
    # Manual Wiring for Standalone execution (DB Mode)
    db = SessionLocal()
    repo = PostgresRepository(db)
    repo = PostgresRepository(db)
    ai = get_ai_provider()
    ledger = get_ledger()
    cognitive_engine = get_cognitive_engine()
    
    pipeline = CognitivePipeline(repo, cognitive_engine, ai, ledger)
    
    # 1. Genesis: First Fragment
    print("\n[Step 1] Injecting Seed Fragment...")
    d1 = await pipeline.process_text("The brain is a prediction machine.", source="sim_1")
    print(f"Decision 1: {d1.action} -> Idea ID: {d1.target_idea_id}")
    idea_id = d1.target_idea_id
    
    if not idea_id:
        print("Error: No Idea Created")
        return

    # 2. Exploration: Adding varying fragments (Simulating ATTACH)
    print("\n[Step 2] Injecting Supporting Fragment (Force Attach via Mock)...")
    # For simulation, we need to ensure the engine decides ATTACH. 
    # In a real vector system, similar text ensures this. 
    # In our engine mock, it blindly creates NEW if list is empty, or ATTACH if list provided.
    # The pipeline must fetch candidates. Our InMemoryRepo mock list_ideas() returns the idea we just saved.
    
    d2 = await pipeline.process_text("Predictions minimize surprise (free energy).", source="sim_2")
    print(f"Decision 2: {d2.action} -> Target: {d2.target_idea_id}")

    print("\n[Step 3] Injecting Third Fragment (Trigger Evolution)...")
    d3 = await pipeline.process_text("This applies to visual cortex as well.", source="sim_3")
    print(f"Decision 3: {d3.action} -> Target: {d3.target_idea_id}")
    print(f"Reasoning 3: {d3.reasoning}")

    # 3. Tension: Inject Contradiction
    print("\n[Step 4] Injecting Contradiction (Trigger Tension)...")
    # Must ensure it attaches to the SAME idea to trigger version update -> check synthesis -> trigger tension
    d4 = await pipeline.process_text("BUT, the predictive coding theory has flaws.", source="sim_4")
    print(f"Decision 4: {d4.action} -> Target: {d4.target_idea_id}")
    print(f"Reasoning 4: {d4.reasoning}")

    # Verify Final State
    repo = pipeline.repo
    idea = await repo.get_idea(idea_id)
    print(f"\n[Final State] Idea '{idea.title_provisional}' Status: {idea.status.upper()}")
    
    if idea.semantic_profile:
        print(f"[Semantic Profile] Count: {idea.semantic_profile.fragment_count}")
        # Show first 3 dims of centroid to verify it's not empty and changing
        # (In mock, all dims are same usually, but let's see)
        print(f"[Semantic Profile] Centroid (Head): {idea.semantic_profile.centroid[:5]}...")
    else:
        print("[Semantic Profile] NOT INITIALIZED (Error)")
    
    # Verify Ledger
    print("\n[Ledger Audit]")
    for entry in pipeline.ledger._ledger:
        print(f"- {entry['timestamp']}: {entry['decision']['action']} ({entry['fragment_preview']})")

if __name__ == "__main__":
    asyncio.run(run_simulation())
