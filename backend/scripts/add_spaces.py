import os
import psycopg2
import uuid

# Use the correct user/pass from docker-compose
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kolozus:kolozus_strong_password@localhost:5432/kolozus_main")

def apply_spaces_schema():
    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Create Spaces Table
        print("Creating spaces table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS spaces (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                description TEXT,
                color VARCHAR(20) DEFAULT '#cbd5e1',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        # 2. Check if Default Space exists, if not create it
        print("Ensuring Default Space exists...")
        cursor.execute("SELECT id FROM spaces WHERE name = 'General';")
        res = cursor.fetchone()
        if res:
            default_space_id = res[0]
            print(f"Default Space 'General' exists: {default_space_id}")
        else:
            default_space_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO spaces (id, name, description) VALUES (%s, %s, %s);", 
                           (default_space_id, 'General', 'Default space for existing content'))
            print(f"Created Default Space 'General': {default_space_id}")

        # 3. Add space_id to fragments
        print("Adding space_id to fragments...")
        try:
            cursor.execute("ALTER TABLE fragments ADD COLUMN space_id UUID REFERENCES spaces(id);")
            print("Successfully added space_id column to fragments.")
        except psycopg2.errors.DuplicateColumn:
            print("Column space_id already exists in fragments.")
            
        # 4. Add space_id to ideas
        print("Adding space_id to ideas...")
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN space_id UUID REFERENCES spaces(id);")
            print("Successfully added space_id column to ideas.")
        except psycopg2.errors.DuplicateColumn:
            print("Column space_id already exists in ideas.")

        # 5. Migrate existing data to Default Space
        print("Migrating existing data to Default Space...")
        cursor.execute("UPDATE fragments SET space_id = %s WHERE space_id IS NULL;", (default_space_id,))
        cursor.execute("UPDATE ideas SET space_id = %s WHERE space_id IS NULL;", (default_space_id,))
        
        cursor.close()
        conn.close()
        print("Schema update complete.")

    except Exception as e:
        print(f"Error applying schema changes: {e}")

if __name__ == "__main__":
    apply_spaces_schema()
