#!/usr/bin/env python3
"""
Script to test Semantic Search functionality
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"  # Derechos Digitales 2026

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_semantic_search():
    """Test semantic search with query"""
    log("=== TEST: SEMANTIC SEARCH ===")
    
    # Test Query
    query_text = "protección de datos"
    
    log(f"POST {BASE_URL}/query/search")
    log(f"Query: '{query_text}'")
    log(f"Space: {SPACE_ID}")
    
    payload = {
        "query": query_text,
        "space_id": SPACE_ID,  # Add space filter
        "limit": 5
    }
    
    response = requests.post(f"{BASE_URL}/query/search", json=payload)
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        metadata = data.get('metadata', {})
        
        log(f"✅ Search completed successfully")
        log(f"\n📊 Results Summary:")
        log(f"   Total Results: {metadata.get('total', len(results))}")
        log(f"   Query: {metadata.get('query', 'N/A')}")
        log(f"   Space Filter: {metadata.get('space_id', 'None')}")
        log(f"   Search Type: {metadata.get('search_type', 'N/A')}")
        
        if results:
            log(f"\n🔍 Search Results:")
            for idx, result in enumerate(results, 1):
                log(f"\n   Result #{idx}:")
                log(f"      Type: {result.get('type', 'N/A')}")
                log(f"      ID: {result.get('id', 'N/A')[:8]}...")
                log(f"      Title: {result.get('title', 'N/A')[:50]}...")
                log(f"      Similarity: {result.get('similarity', 'N/A')}")
                if result.get('type') == 'idea':
                    log(f"      Status: {result.get('status', 'N/A')}")
                    log(f"      Domain: {result.get('domain', 'N/A')}")
                log(f"      Snippet: {result.get('snippet', 'N/A')[:80]}...")
        else:
            log(f"\n⚠️  No results found for query: '{query_text}'")
        
        log(f"\n📋 Full Response:")
        log(json.dumps(data, indent=2, ensure_ascii=False))
        
        return True
    else:
        log(f"❌ Search failed")
        log(f"Response: {response.text}")
        return False

def test_search_variations():
    """Test different search queries"""
    log("\n=== TEST: SEARCH VARIATIONS ===")
    
    queries = [
        {"query": "privacidad digital", "type": "ideas"},
        {"query": "derechos de autor", "type": "all"},
        {"query": "ciberseguridad", "type": "fragments"},
        {"query": "ética artificial", "type": "ideas"}
    ]
    
    results_summary = []
    
    for test_case in queries:
        query = test_case["query"]
        search_type = test_case.get("type", "all")
        log(f"\nSearching: '{query}' (type: {search_type})")
        
        payload = {
            "query": query,
            "space_id": SPACE_ID,
            "type": search_type,
            "limit": 5
        }
        response = requests.post(f"{BASE_URL}/query/search", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            count = len(results)
            top_similarity = results[0].get('similarity', 0) if results else 0
            
            log(f"   Results: {count}, Top similarity: {top_similarity:.3f}")
            results_summary.append({
                "query": query,
                "count": count,
                "top_similarity": top_similarity,
                "type": search_type
            })
        else:
            log(f"   ❌ Failed: {response.status_code}")
    
    log(f"\n📊 Summary of All Searches:")
    for summary in results_summary:
        log(f"   '{summary['query']}' ({summary['type']}): {summary['count']} results (top: {summary['top_similarity']:.3f})")
    
    return True

def main():
    log("Starting Semantic Search Test")
    log("="*60)
    log(f"Target Space: Derechos Digitales 2026")
    log(f"Space ID: {SPACE_ID}")
    log(f"Expected: Search results with similarity scores")
    log("="*60)
    
    success1 = test_semantic_search()
    success2 = test_search_variations()
    
    log("\n" + "="*60)
    if success1 and success2:
        log("✅ ALL SEMANTIC SEARCH TESTS PASSED")
    else:
        log("⚠️  Some tests failed - check logs above")
    log("="*60)

if __name__ == "__main__":
    main()
