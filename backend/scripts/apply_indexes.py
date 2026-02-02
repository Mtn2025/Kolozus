import sys
import os
from sqlalchemy import create_engine, text

# Add parent dir to path to find infrastructure
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.database import DATABASE_URL

def apply_indexes():
    print(f"Connecting to {DATABASE_URL}...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking if vector extension exists...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
        
        print("Applying HNSW Index to 'ideas.embedding'...")
        try:
            # Idempotent-ish: try create, catch if exists
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_ideas_embedding 
                ON ideas 
                USING hnsw (embedding vector_cosine_ops) 
                WITH (m = 16, ef_construction = 64);
            """))
            conn.commit()
            print("Index applied successfully.")
        except Exception as e:
            print(f"Error applying index: {e}")

if __name__ == "__main__":
    apply_indexes()
