
import os
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/kolozus")
engine = create_engine(db_url)

with engine.connect() as conn:
    print("--- DUMPING FRAGMENTS ---")
    rows = conn.execute(text("SELECT id, left(raw_text, 20), space_id FROM fragments")).fetchall()
    for r in rows:
        print(r)
    
    print(f"Total Count: {len(rows)}")

    print("\n--- DUMPING IDEAS ---")
    rows_i = conn.execute(text("SELECT id, title_provisional, space_id FROM ideas")).fetchall()
    for r in rows_i:
        print(r)
