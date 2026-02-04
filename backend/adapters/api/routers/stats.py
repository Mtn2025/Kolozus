from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.database import get_db
from adapters.orm import FragmentModel, SpaceModel, ProductModel, IdeaModel, DecisionLogModel

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
    responses={404: {"description": "Not found"}},
)

@router.get("/vectors")
async def get_vector_stats(db: Session = Depends(get_db)):
    """
    Real-time vector distribution statistics.
    """
    total = db.query(FragmentModel).count()
    
    # Group by Space (using space_id)
    # This query might be slow on huge datasets, but fine for now
    space_stats = db.query(
        FragmentModel.space_id, func.count(FragmentModel.id)
    ).group_by(FragmentModel.space_id).all()
    
    # Map space_ids to names if possible would be nice, but pure IDs are faster.
    # Frontend can map if it has spaces, or we do a join.
    # Let's do a join.
    
    detailed = db.query(
        SpaceModel.name, func.count(FragmentModel.id)
    ).join(SpaceModel, SpaceModel.id == FragmentModel.space_id)\
     .group_by(SpaceModel.name).all()
    
    return {
        "total_embeddings": total,
        "spaces_breakdown": {name: count for name, count in detailed}
    }

@router.get("/entropy")
async def get_entropy_metrics(db: Session = Depends(get_db)):
    """
    Calculates system cognitive drift and stability.
    """
    # 1. Fragments vs Ideas ratio
    total_fragments = db.query(FragmentModel).count()
    total_ideas = db.query(IdeaModel).count()
    
    # 2. Unlinked Fragments (fragments not in decision logs or idea_fragments? or just not processed?)
    # For now, let's assume all fragments are processed. 
    # Let's count "germinal" ideas vs "consolidated"
    germinal = db.query(IdeaModel).filter(IdeaModel.status == 'germinal').count()
    consolidated = db.query(IdeaModel).filter(IdeaModel.status == 'consolidada').count()
    
    # Heuristic Entropy Score (lower is better/more stable)
    # High germinal count = high entropy (lots of new chaos)
    entropy_score = 0.0
    if total_ideas > 0:
        entropy_score = (germinal / total_ideas) * 10.0
    
    return {
        "cognitive_drift": round(entropy_score, 2), # 0-10 scale
        "stability_percentage": max(0, 100 - (entropy_score * 10)),
        "germinal_ideas": germinal,
        "consolidated_ideas": consolidated
    }

@router.get("/counts")
async def get_system_counts(db: Session = Depends(get_db)):
    return {
        "spaces": db.query(SpaceModel).count(),
        "products": db.query(ProductModel).count(),
        "fragments": db.query(FragmentModel).count(),
        "decisions_logged": db.query(DecisionLogModel).count()
    }
