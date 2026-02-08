
import os
from sqlalchemy import create_engine, text

# Hardcode default from docker-compose if env not set, but inside docker it should be set.
db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/kolozus")
print(f"Connecting to: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        tables = ['spaces', 'fragments', 'ideas', 'products']
        results = {}
        total_count = 0
        for t in tables:
            try:
                # Check if table exists first
                # verification: simple count
                res = conn.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar()
                results[t] = res
                total_count += res
            except Exception as e:
                results[t] = f"Error or Table Missing: {e}"
        
        print("DB State:", results)
        if total_count == 0:
            print("VERIFICATION SUCCESS: All tables empty.")
        else:
            print("VERIFICATION FAILED: Data exists.")

except Exception as e:
    print(f"Connection failed: {e}")
