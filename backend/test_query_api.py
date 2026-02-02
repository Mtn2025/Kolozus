import requests
import json
import asyncio
from uuid import UUID

BASE_URL = "http://localhost:8000"

def test_graph():
    print("\n--- Testing Knowledge Graph ---")
    try:
        response = requests.get(f"{BASE_URL}/query/knowledge-graph")
        if response.status_code == 200:
            nodes = response.json()
            print(f"Graph Nodes ({len(nodes)}):")
            for n in nodes:
                print(f" - [{n['status'].upper()}] {n['label']} (W:{n['weight']}) ID:{n['id']}")
            return nodes
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Connection Error: {e}")
        return []

def test_idea_details(idea_id):
    print(f"\n--- Testing Idea Detail ({idea_id}) ---")
    try:
        response = requests.get(f"{BASE_URL}/query/idea/{idea_id}")
        if response.status_code == 200:
            idea = response.json()
            print(f"Title: {idea['title_provisional']}")
            profile = idea.get('semantic_profile')
            if profile:
                print(f"Semantic Profile: {profile['fragment_count']} fragments. Centroid head: {profile['centroid'][:3]}...")
            else:
                print("No Semantic Profile")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

def test_history(idea_id):
    print(f"\n--- Testing History ({idea_id}) ---")
    try:
        response = requests.get(f"{BASE_URL}/query/idea/{idea_id}/history")
        if response.status_code == 200:
            versions = response.json()
            print(f"Versions Found: {len(versions)}")
            for v in versions:
                print(f" v{v['version_number']} [{v['stage']}]: {v['synthesized_text'][:50]}...")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    nodes = test_graph()
    if nodes:
        target_id = nodes[0]['id']
        test_idea_details(target_id)
        test_history(target_id)
    else:
        print("Graph empty or unreachable.")
