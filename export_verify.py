import json
import urllib.request
import os

BASE_URL = "http://localhost:8000"
REPORT_DIR = "simulation_report"
EXPORT_DIR = os.path.join(REPORT_DIR, "phase_9_export")

if not os.path.exists(EXPORT_DIR):
    os.makedirs(EXPORT_DIR)

try:
    # Read Product ID
    with open(os.path.join(REPORT_DIR, "phase_5_products", "api_create_product.json"), 'r') as f:
        data = json.load(f)
        pid = data["id"]
        
    print(f"Exporting Product ID: {pid}")
    
    # Hit Export Endpoint
    url = f"{BASE_URL}/products/{pid}/export"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        
    # Save Response
    with open(os.path.join(EXPORT_DIR, "export_response.md"), 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Export Verification Successful")

except Exception as e:
    print(f"Export Verification Failed: {e}")
