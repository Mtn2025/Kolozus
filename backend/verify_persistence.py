import requests
import json
import sys
import time

BASE_URL = "http://localhost:8000"

def get_graph_snapshot():
    try:
        res = requests.get(f"{BASE_URL}/query/knowledge-graph")
        res.raise_for_status()
        data = res.json()
        # Sort by ID to ensure consistent ordering for comparison
        data.sort(key=lambda x: x['id'])
        return data
    except Exception as e:
        print(f"Error fetching graph: {e}")
        return None

def save_snapshot(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Snapshot saved to {filename}")

def compare_snapshots(file1, file2):
    with open(file1, 'r') as f:
        data1 = json.load(f)
    with open(file2, 'r') as f:
        data2 = json.load(f)
    
    if data1 == data2:
        print("SUCCESS: Snapshots match perfectly.")
        print(f"Count: {len(data1)} ideas.")
        return True
    else:
        print("FAILURE: Snapshots differ.")
        # Simple diff
        ids1 = set(x['id'] for x in data1)
        ids2 = set(x['id'] for x in data2)
        if ids1 != ids2:
            print(f"ID Mismatch. Pre: {len(ids1)}, Post: {len(ids2)}")
            print(f"Missing in Post: {ids1 - ids2}")
        else:
            print("IDs match, but content differs (Status/Weight?).")
        return False

if __name__ == "__main__":
    mode = sys.argv[1] # 'pre' or 'post'
    
    if mode == 'pre':
        print("Taking PRE-RESTART snapshot...")
        data = get_graph_snapshot()
        if data is not None:
            save_snapshot("snapshot_pre.json", data)
        else:
            sys.exit(1)
            
    elif mode == 'post':
        print("Waiting for server to be up...")
        time.sleep(2) # Give it a moment to accept connections
        
        print("Taking POST-RESTART snapshot...")
        data = get_graph_snapshot()
        if data is not None:
            save_snapshot("snapshot_post.json", data)
            compare_snapshots("snapshot_pre.json", "snapshot_post.json")
        else:
            sys.exit(1)
