from infrastructure.database import SessionLocal
from adapters.orm import DecisionLogModel
from sqlalchemy import func

def verify_ledger():
    db = SessionLocal()
    try:
        count = db.query(func.count(DecisionLogModel.id)).scalar()
        print(f"Total Decisions in Ledger: {count}")
        
        if count > 0:
            last_entry = db.query(DecisionLogModel).order_by(DecisionLogModel.timestamp.desc()).first()
            print("\nLatest Entry:")
            print(f"Action: {last_entry.action}")
            print(f"Fragment ID: {last_entry.fragment_id}")
            print(f"Reasoning: {last_entry.reasoning}")
            print(f"Timestamp: {last_entry.timestamp}")
            print(f"Metadata: {last_entry.meta_data}")
            return True
        else:
            print("Ledger is empty.")
            return False
            
    finally:
        db.close()

if __name__ == "__main__":
    verify_ledger()
