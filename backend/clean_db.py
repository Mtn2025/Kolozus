
import os
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/kolozus")
print(f"Cleaning DB at: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        # Use CASCADE to handle foreign keys
        tables = ['products', 'ideas', 'fragments', 'spaces'] 
        for t in tables:
            try:
                conn.execute(text(f"TRUNCATE TABLE {t} CASCADE;"))
                print(f"Truncated {t}")
            except Exception as e:
                # Table might not exist
                print(f"Error truncating {t}: {e}")
        
        conn.commit()
    print("Clean complete.")

except Exception as e:
    print(f"Connection failed: {e}")
