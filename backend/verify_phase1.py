
import requests
import sys
import os
from sqlalchemy import create_engine, text
import json

BASE_URL = "http://localhost:8000"
DB_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/kolozus")

def log(msg):
    print(f"[PHASE 1] {msg}")

def check_api(name, method, url, data=None, expected_status=[200, 201]):
    try:
        if method == 'POST':
            resp = requests.post(url, json=data)
        elif method == 'GET':
            resp = requests.get(url)
        
        if resp.status_code in expected_status:
            log(f"[PASS] API {name}: {resp.status_code}")
            return resp.json()
        else:
            log(f"[FAIL] API {name}: {resp.status_code} {resp.text}")
            sys.exit(1)
    except Exception as e:
        log(f"[ERROR] API {name}: {e}")
        sys.exit(1)

def check_db(name_query):
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT id, name, description, created_at FROM spaces WHERE name = '{name_query}'")).fetchone()
            if result:
                log(f"[PASS] DB Check: Found space '{result[1]}'")
                return dict(result._mapping)
            else:
                log(f"[FAIL] DB Check: Space '{name_query}' NOT FOUND")
                sys.exit(1)
    except Exception as e:
        log(f"[ERROR] DB Check: {e}")
        sys.exit(1)

# --- EXECUTION ---
log("Starting Phase 1: Create Space CRUD")

# 1. Create Space
payload = {
  "name": "Proyecto Legal X",
  "description": "Investigación sobre derechos digitales"
}
created_space = check_api("Create Space", "POST", f"{BASE_URL}/spaces/", payload)
space_id = created_space['id']
log(f"Created Response: {json.dumps(created_space, indent=2)}")

# 2. Verify DB
db_space = check_db("Proyecto Legal X")
log(f"DB Record: {db_space}")

# 3. List Spaces (Simulate UI List)
list_spaces = check_api("List Spaces", "GET", f"{BASE_URL}/spaces/")
log(f"List Response (Count: {len(list_spaces)}): {json.dumps(list_spaces, indent=2)}")

# 4. Get Detail (Simulate UI Detail)
detail_space = check_api("Get Space Detail", "GET", f"{BASE_URL}/spaces/{space_id}")
log(f"Detail Response: {json.dumps(detail_space, indent=2)}")

# Verify specific fields
assert detail_space['name'] == "Proyecto Legal X"
assert detail_space['description'] == "Investigación sobre derechos digitales"
log("[PASS] All Field Validations Verified")
