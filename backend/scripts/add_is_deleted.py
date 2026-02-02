import os
import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kolozus:kolozus_strong_password@localhost:5432/kolozus_main")

def apply_soft_delete_schema():
    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Add is_deleted to fragments
        print("Adding is_deleted to fragments...")
        try:
            cursor.execute("ALTER TABLE fragments ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;")
            print("Successfully added to fragments.")
        except psycopg2.errors.DuplicateColumn:
            print("Column is_deleted already exists in fragments.")
            
        # Add is_deleted to ideas
        print("Adding is_deleted to ideas...")
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;")
            print("Successfully added to ideas.")
        except psycopg2.errors.DuplicateColumn:
            print("Column is_deleted already exists in ideas.")

        cursor.close()
        conn.close()
        print("Schema update complete.")

    except Exception as e:
        print(f"Error applying schema changes: {e}")

if __name__ == "__main__":
    apply_soft_delete_schema()
