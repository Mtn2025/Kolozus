import asyncio
import json
import datetime
from sqlalchemy import text
from infrastructure.database import SessionLocal, engine, Base
from domain.models import Idea, Fragment, IdeaVersion

# Encoder for datetime
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        return super().default(o)

async def backup_data():
    print("--- Backing up Database ---")
    db = SessionLocal()
    try:
        # Fetch all data (using raw SQL or ORM if models are bound, but models are Pydantic in domain/models.py 
        # relying on ORM in adapters/orm.py. I should use ORM models but I need to import them from adapters.orm)
        
        # Quick hack: Use raw SQL for speed and ensuring we get everything stored
        tables = ["fragments", "ideas", "idea_versions"]
        backup = {}
        
        with engine.connect() as conn:
            for t in tables:
                result = conn.execute(text(f"SELECT * FROM {t}"))
                rows = [dict(row._mapping) for row in result]
                backup[t] = rows
        
        filename = f"backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w") as f:
            json.dump(backup, f, cls=DateTimeEncoder, indent=2)
        print(f"Backup saved to {filename}")
        
    except Exception as e:
        print(f"Backup failed: {e}")
    finally:
        db.close()

async def reset_db():
    print("--- Resetting Database ---")
    # Drop all tables and recreate
    # We need to make sure we import valid ORM models to recreate them
    from adapters.orm import Base
    
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")
    Base.metadata.create_all(bind=engine)
    print("Tables recreated.")
    
    # Ensure extension exists (it persists per DB but good to be safe)
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

if __name__ == "__main__":
    asyncio.run(backup_data())
    asyncio.run(reset_db())
