#!/usr/bin/env python3
"""
Script to test CRUD operations for Spaces
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_create_space():
    """CREATE - Test POST /spaces/"""
    log("=== TEST: CREATE SPACE ===")
    
    payload = {
        "name": "Derechos Digitales 2026",
        "description": "Investigación sobre derechos digitales"
    }
    
    log(f"POST {BASE_URL}/spaces/")
    log(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/spaces/", json=payload)
    
    log(f"Status Code: {response.status_code}")
    log(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code in [200, 201]:
        space_id = response.json()['id']
        log(f"✅ Space created successfully: {space_id}")
        return space_id
    else:
        log(f"❌ Failed to create space")
        return None

def test_list_spaces():
    """READ (List) - Test GET /spaces/"""
    log("\n=== TEST: LIST SPACES ===")
    
    log(f"GET {BASE_URL}/spaces/")
    
    response = requests.get(f"{BASE_URL}/spaces/")
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        spaces = response.json()
        log(f"✅ Found {len(spaces)} spaces:")
        for space in spaces:
            log(f"  - {space['name']} (ID: {space['id']})")
        return spaces
    else:
        log(f"❌ Failed to list spaces")
        return []

def test_get_space_detail(space_id):
    """READ (Detail) - Test GET /spaces/{id}"""
    log(f"\n=== TEST: GET SPACE DETAIL ===")
    
    log(f"GET {BASE_URL}/spaces/{space_id}")
    
    response = requests.get(f"{BASE_URL}/spaces/{space_id}")
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        space = response.json()
        log(f"✅ Space details:")
        log(json.dumps(space, indent=2))
        return space
    else:
        log(f"❌ Failed to get space detail")
        log(f"Response: {response.text}")
        return None

def verify_database():
    """Verify database state"""
    log("\n=== DATABASE VERIFICATION ===")
    log("Run this SQL query to verify:")
    log("  SELECT id, name, description, created_at FROM spaces ORDER BY created_at DESC LIMIT 5;")

def main():
    log("Starting CRUD Operations Test for Spaces")
    log("="*60)
    
    # CREATE
    space_id = test_create_space()
    
    # LIST
    spaces = test_list_spaces()
    
    # DETAIL
    if space_id:
        test_get_space_detail(space_id)
    elif spaces:
        # Use first space if creation failed
        space_id = spaces[0]['id']
        log(f"\nUsing existing space for detail test: {space_id}")
        test_get_space_detail(space_id)
    
    # DATABASE VERIFICATION
    verify_database()
    
    log("\n" + "="*60)
    log("✅ CRUD Operations Test Completed")

if __name__ == "__main__":
    main()
