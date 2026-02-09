import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def init_db():
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        from urllib.parse import urlparse
        parsed = urlparse(database_url)
        db_name = parsed.path[1:] # remove leading /
        user = parsed.username
        password = parsed.password
        host = parsed.hostname
        port = parsed.port or 5432
    else:
        db_name = os.getenv("POSTGRES_DB", "postgres") # Standard default, not hardcoded project name
        user = os.getenv("POSTGRES_USER", "postgres")
        password = os.getenv("POSTGRES_PASSWORD", "postgres")
        host = os.getenv("POSTGRES_HOST", "db")
        port = os.getenv("POSTGRES_PORT", "5432")

    print(f"Checking if database '{db_name}' exists...")

    try:
        # Connect to default 'postgres' database to check/create target DB
        con = psycopg2.connect(dbname='postgres', user=user, host=host, password=password, port=port)
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()

        # Check if DB exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cur.fetchone()

        if not exists:
            print(f"Database '{db_name}' does not exist. Creating...")
            cur.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully.")
        else:
            print(f"Database '{db_name}' already exists. Skipping creation.")

        cur.close()
        con.close()

    except Exception as e:
        print(f"Error checking/creating database: {e}")
        # Build logic: If we can't connect, maybe DB isn't ready. This script is meant to run *before* app starts.
        # Failing here is probably okay since app will fail later anyway.
        sys.exit(1)

if __name__ == "__main__":
    init_db()
