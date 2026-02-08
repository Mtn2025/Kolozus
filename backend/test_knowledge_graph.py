#!/usr/bin/env python3
"""
Script to test improved Knowledge Graph endpoint with edges
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"  # Derechos Digitales 2026

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_knowledge_graph_improved():
    """Test improved knowledge graph endpoint with edges"""
    log("=== TEST: IMPROVED KNOWLEDGE GRAPH ===")
    
    log(f"GET {BASE_URL}/query/knowledge-graph?space_id={SPACE_ID}")
    
    response = requests.get(f"{BASE_URL}/query/knowledge-graph", params={"space_id": SPACE_ID})
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        graph_data = response.json()
        log(f"✅ Knowledge Graph retrieved successfully")
        
        # Analyze structure
        nodes = graph_data.get('nodes', [])
        edges = graph_data.get('edges', [])
        metadata = graph_data.get('metadata', {})
        
        log(f"\n📊 Graph Structure:")
        log(f"   Total Nodes: {len(nodes)}")
        log(f"   Total Edges: {len(edges)}")
        log(f"   Space Filter: {metadata.get('space_id', 'None')}")
        
        if nodes:
            log(f"\n🔵 Nodes:")
            for node in nodes:
                log(f"   - {node.get('id')[:8]}...: {node.get('label', 'N/A')[:50]}")
                log(f"     Status: {node.get('status')}, Weight: {node.get('weight')}, Domain: {node.get('domain')}")
        
        if edges:
            log(f"\n🔗 Edges:")
            for edge in edges:
                log(f"   - {edge.get('source')[:8]}... → {edge.get('target')[:8]}... (similarity: {edge.get('similarity')})")
        else:
            log(f"\n⚠️  No edges found (similarity below threshold or insufficient data)")
        
        log(f"\n📋 Full Response:")
        log(json.dumps(graph_data, indent=2))
        
        return True
    else:
        log(f"❌ Failed to retrieve knowledge graph")
        log(f"Response: {response.text}")
        return False

def test_without_filter():
    """Test knowledge graph without space filter"""
    log("\n=== TEST: KNOWLEDGE GRAPH WITHOUT FILTER ===")
    
    log(f"GET {BASE_URL}/query/knowledge-graph (no space_id filter)")
    
    response = requests.get(f"{BASE_URL}/query/knowledge-graph")
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        graph_data = response.json()
        nodes = graph_data.get('nodes', [])
        edges = graph_data.get('edges', [])
        
        log(f"✅ Knowledge Graph retrieved (unfiltered)")
        log(f"   Total Nodes: {len(nodes)}")
        log(f"   Total Edges: {len(edges)}")
        
        return True
    else:
        log(f"❌ Failed")
        return False

def main():
    log("Starting Improved Knowledge Graph Test")
    log("="*60)
    log(f"Target Space: Derechos Digitales 2026")
    log(f"Space ID: {SPACE_ID}")
    log(f"Expected: 4 nodes + edges based on similarity")
    log("="*60)
    
    success1 = test_knowledge_graph_improved()
    success2 = test_without_filter()
    
    log("\n" + "="*60)
    if success1 and success2:
        log("✅ ALL KNOWLEDGE GRAPH TESTS PASSED")
    else:
        log("⚠️  Some tests failed - check logs above")
    log("="*60)

if __name__ == "__main__":
    main()
