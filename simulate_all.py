import os
import json
import subprocess
import time
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"
REPORT_DIR = "simulation_report"

def run_command(cmd):
    try:
        print(f"Running: {cmd}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        return str(e)

def http_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"HTTP {method} {url}")
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.data = json_data
        
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        return {"error": e.code, "message": e.reason, "body": e.read().decode('utf-8')}
    except Exception as e:
        print(f"Request Failed: {e}")
        return {"error": "exception", "message": str(e)}

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def save_text(path, text):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def phase_spaces():
    print("--- Phase: Spaces ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_1_spaces")
    ensure_dir(phase_dir)
    
    # 1. Create
    payload = {"name": "Simulation Space", "description": "Auto-generated", "icon": "cpu", "color": "blue"}
    resp = http_request("POST", "/spaces/", payload)
    save_json(os.path.join(phase_dir, "api_create_response.json"), resp)
    space_id = resp.get("id")
    
    if not space_id:
        print("Failed to create space")
        return None

    # 2. Get
    resp = http_request("GET", f"/spaces/{space_id}")
    save_json(os.path.join(phase_dir, "api_get_response.json"), resp)
    
    # 3. DB Check
    db_out = run_command(f'docker exec kolozus-db-1 psql -U user -d kolozus -c "SELECT * FROM spaces WHERE id = \'{space_id}\';"')
    save_text(os.path.join(phase_dir, "db_verification.txt"), db_out)
    
    return space_id

def phase_ingest(space_id):
    print("--- Phase: Ingestion ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_2_ingest")
    ensure_dir(phase_dir)
    
    # 1. Ingest
    text = "El sistema Kolozus permite la observabilidad cognitiva mediante grafos de conocimiento."
    payload = {"text": text, "source": "simulation_script", "mode": "default", "space_id": space_id}
    resp = http_request("POST", "/ingest/", payload)
    save_json(os.path.join(phase_dir, "api_ingest_response.json"), resp)
    
    # 2. Batch (Simulated)
    payload2 = {**payload, "text": "Fragmento 2 del lote simulado."}
    resp2 = http_request("POST", "/ingest/", payload2)
    save_json(os.path.join(phase_dir, "api_ingest_response_2.json"), resp2)
    
    # 3. DB Check
    db_out = run_command(f'docker exec kolozus-db-1 psql -U user -d kolozus -c "SELECT count(*) FROM fragments WHERE space_id = \'{space_id}\';"')
    save_text(os.path.join(phase_dir, "db_count.txt"), db_out)

def phase_graph(space_id):
    print("--- Phase: Knowledge Graph ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_3_graph")
    ensure_dir(phase_dir)
    
    # 1. Query Graph
    resp = http_request("GET", f"/query/knowledge-graph?space_id={space_id}")
    save_json(os.path.join(phase_dir, "api_graph_response.json"), resp)

def phase_search(space_id):
    print("--- Phase: Search ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_4_search")
    ensure_dir(phase_dir)
    
    # 1. Search
    payload = {"query": "observabilidad", "space_id": space_id, "limit": 5}
    resp = http_request("POST", "/query/search", payload)
    save_json(os.path.join(phase_dir, "api_search_response.json"), resp)

def phase_products(space_id):
    print("--- Phase: Products ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_5_products")
    ensure_dir(phase_dir)
    
    # 1. Create Product
    payload = {"name": "Simulated Product", "description": "For testing blueprint", "space_id": space_id}
    resp = http_request("POST", "/products/", payload)
    save_json(os.path.join(phase_dir, "api_create_product.json"), resp)
    product_id = resp.get("id")
    
    # 2. List
    resp = http_request("GET", f"/products/?space_id={space_id}")
    save_json(os.path.join(phase_dir, "api_list_products.json"), resp)
    
    return product_id

def phase_blueprint(product_id):
    print("--- Phase: Blueprint ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_6_blueprint")
    ensure_dir(phase_dir)
    
    if not product_id:
        print("Skipping Blueprint (No Product ID)")
        return
        
    # 1. Generate Blueprint
    resp = http_request("POST", f"/products/{product_id}/blueprint")
    save_json(os.path.join(phase_dir, "api_blueprint_response.json"), resp)
    
    # Capture sections created
    db_out = run_command(f'docker exec kolozus-db-1 psql -U user -d kolozus -c "SELECT count(*) FROM product_sections WHERE product_id = \'{product_id}\';"')
    save_text(os.path.join(phase_dir, "db_sections_count.txt"), db_out)
    
def phase_audit():
    print("--- Phase: Audit ---")
    phase_dir = os.path.join(REPORT_DIR, "phase_11_audit")
    ensure_dir(phase_dir)
    
    resp = http_request("GET", "/audit/stats")
    save_json(os.path.join(phase_dir, "api_stats.json"), resp)

if __name__ == "__main__":
    try:
        ensure_dir(REPORT_DIR)
        
        sid = phase_spaces()
        if sid:
            phase_ingest(sid)
            phase_graph(sid)
            phase_search(sid)
            pid = phase_products(sid)
            if pid:
                phase_blueprint(pid)
        
        phase_audit()
        
        print(f"Simulation Complete. Results in {os.path.abspath(REPORT_DIR)}")

    except Exception as e:
        print(f"Simulation Failed: {e}")
