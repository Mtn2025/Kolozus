
import requests
import json
import uuid
import sys
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000"

def audit_request(method, path, body=None, params=None, desc=""):
    try:
        url = f"{BASE_URL}{path}"
        headers = {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000' # Simulate Frontend Request
        }
        
        response = requests.request(method, url, json=body, params=params, headers=headers)
        
        # Try to parse JSON error if 400/500
        error_msg = None
        if response.status_code >= 400:
            try:
                error_msg = response.json()
            except:
                error_msg = response.text

        return {
            "route": path,
            "method": method,
            "status": response.status_code,
            "cors_header": response.headers.get("access-control-allow-origin"),
            "content_type": response.headers.get("content-type"),
            "error": error_msg,
            "description": desc
        }
    except Exception as e:
        return {
            "route": path,
            "method": method,
            "status": 0,
            "error": str(e),
            "description": desc
        }

def run_audit():
    results = []
    
    # helper to get IDs
    space_id = str(uuid.uuid4())
    fragment_id = str(uuid.uuid4())
    product_id = str(uuid.uuid4())

    print("Starting Stateful Audit...")

    # 1. Root & Health
    results.append(audit_request("GET", "/", desc="Root"))
    results.append(audit_request("GET", "/health", desc="Health Check"))

    # 2. CREATE SPACE (Critical for other tests)
    r_create_space = audit_request("POST", "/spaces/", body={"name": "Audit Real Space"}, desc="Create Space")
    results.append(r_create_space)
    if r_create_space["status"] == 200:
        # Fetch list to get ID (assuming API returns created object or we list)
        r_list = requests.get(f"{BASE_URL}/spaces/")
        if r_list.status_code == 200:
            spaces = r_list.json()
            # Find the one we just created
            for s in spaces:
                if s["name"] == "Audit Real Space":
                    space_id = s["id"]
                    print(f"Captured Space ID: {space_id}")
                    break

    # 3. GET SPACE
    results.append(audit_request("GET", f"/spaces/{space_id}", desc="Get Space Detail"))

    # 4. INGEST (Create Fragment)
    r_ingest = audit_request("POST", "/ingest/", body={"text": "Robust Audit Fragment", "space_id": space_id}, desc="Ingest Fragment")
    results.append(r_ingest)
    
    # 5. LIST FRAGMENTS & CAPTURE ID
    r_frags = audit_request("GET", "/query/fragments", params={"limit": 5}, desc="List Fragments")
    results.append(r_frags)
    if r_frags["status"] == 200:
        data = requests.get(f"{BASE_URL}/query/fragments").json()
        if data:
            # Find our fragment
            for f in data:
                if "Robust Audit" in f.get("raw_text", ""):
                    fragment_id = f["id"]
                    print(f"Captured Fragment ID: {fragment_id}")
                    break

    # 6. CREATE PRODUCT (Depends on Space)
    r_create_prod = audit_request("POST", "/products/", body={"title": "Robust Audit Product", "space_id": space_id}, desc="Create Product")
    results.append(r_create_prod)
    
    # 7. CAPTURE PRODUCT ID
    # If create returned the object, use it. Otherwise list.
    if r_create_prod["status"] == 200:
        # Assuming payload response is the product
        try:
             # If headers say json
             created_prod = requests.post(f"{BASE_URL}/products/", json={"title": "Robust Audit Product 2", "space_id": space_id}).json()
             product_id = created_prod["id"]
             print(f"Captured Product ID from Create: {product_id}")
        except:
             pass

    # list products just in case
    r_prods = requests.get(f"{BASE_URL}/products/", params={"space_id": space_id})
    if r_prods.status_code == 200:
        data = r_prods.json()
        for p in data:
            if "Robust Audit" in p["title"]:
                product_id = p["id"]
                break

    # 8. Product Endpoints (Using Real ID)
    results.append(audit_request("GET", f"/products/{product_id}", desc="Product Detail"))
    results.append(audit_request("GET", f"/products/{product_id}/preview", desc="Product Preview HTML"))
    results.append(audit_request("GET", f"/products/{product_id}/export", desc="Product Export"))
    results.append(audit_request("POST", f"/products/{product_id}/blueprint", desc="Product Blueprint"))
    results.append(audit_request("POST", f"/products/{product_id}/sections", body={"title": "New Section"}, desc="Add Section"))
    results.append(audit_request("PATCH", f"/products/{product_id}", body={"design_overrides": {}}, desc="Update Product"))

    # 9. Query Endpoints
    results.append(audit_request("GET", f"/query/fragment/{fragment_id}", desc="Fragment Detail"))
    results.append(audit_request("POST", "/query/search", body={"query": "Robust"}, desc="Search (Should find fragment)"))
    results.append(audit_request("GET", "/query/knowledge-graph", desc="Knowledge Graph"))

    # 10. Audit Endpoints
    results.append(audit_request("GET", f"/audit/fragment/{fragment_id}", desc="Audit Fragment History"))
    # Replay requires older version, might 404 if new, but let's try
    results.append(audit_request("POST", f"/audit/replay/{fragment_id}", desc="Audit Replay"))

    # 11. Trash Endpoints
    results.append(audit_request("GET", "/trash/", desc="List Trash"))
    results.append(audit_request("POST", f"/trash/fragment/{fragment_id}", desc="Move to Trash"))
    results.append(audit_request("POST", f"/trash/restore/fragment/{fragment_id}", desc="Restore from Trash"))
    
    # 12. Configs
    results.append(audit_request("GET", "/api/ai/config", desc="AI Config"))
    results.append(audit_request("POST", "/api/ai/config", body={"profile_name": "guardian"}, desc="Update AI Config (Valid)"))
    results.append(audit_request("GET", "/ui/config", desc="UI Config"))
    results.append(audit_request("POST", "/ui/config", body={"theme": "dark-modern"}, desc="Update UI Config"))

    print(json.dumps({"endpoints": results}, indent=2))

if __name__ == "__main__":
    run_audit()
