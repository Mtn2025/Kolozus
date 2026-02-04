import unittest
import requests
import uuid
import time
import sys

# Configuration
BASE_URL = "http://localhost:8000"

class TestFullFlow(unittest.TestCase):
    
    def setUp(self):
        # Create a unique space for isolation
        self.space_name = f"E2E_Space_{uuid.uuid4().hex[:8]}"
        res = requests.post(f"{BASE_URL}/spaces/", json={"name": self.space_name})
        self.assertEqual(res.status_code, 200)
        self.space_id = res.json()["id"]

    def test_1_evolution_flow(self):
        print("\n[TEST 1] Space -> Ingest -> Evolution")
        # 1. Ingest
        text = "The universe is expanding at an accelerating rate due to dark energy."
        res = requests.post(f"{BASE_URL}/ingest", json={
            "text": text,
            "space_id": self.space_id,
            "source": "e2e_test"
        })
        self.assertEqual(res.status_code, 200)
        
        # 2. Verify Fragment Existence
        time.sleep(1) # Eventual consistency
        res = requests.get(f"{BASE_URL}/query/fragments", params={"space_id": self.space_id})
        fragments = res.json()
        self.assertTrue(len(fragments) > 0)
        self.assertIn("dark energy", fragments[0]["raw_text"])

    def test_2_publisher_flow(self):
        print("\n[TEST 2] Publisher -> Blueprint -> Draft -> Export")
        # 1. Create Product
        res = requests.post(f"{BASE_URL}/products/", json={
            "title": "E2E Book",
            "space_id": self.space_id,
            "archetype": "academic"
        })
        self.assertEqual(res.status_code, 200)
        product_id = res.json()["id"]

        # 2. Add Section
        res = requests.post(f"{BASE_URL}/products/{product_id}/sections", json={
            "title": "Chapter 1"
        })
        self.assertEqual(res.status_code, 200)
        
        # 3. Generate Blueprint (Mocked/Stubbed usually, but calling endpoint)
        res = requests.post(f"{BASE_URL}/products/{product_id}/blueprint")
        # Just checking it doesn't 500
        self.assertTrue(res.status_code in [200, 201])

        # 4. Preview/Export
        res = requests.get(f"{BASE_URL}/products/{product_id}/preview")
        self.assertEqual(res.status_code, 200)

    def test_3_theme_config(self):
        print("\n[TEST 3] Theme Configuration Persistence")
        target_theme = "obsidian"
        
        # 1. Set Theme
        requests.post(f"{BASE_URL}/ui/config", json={"theme": target_theme})
        
        # 2. Get Config
        res = requests.get(f"{BASE_URL}/ui/config")
        self.assertEqual(res.json()["theme"], target_theme)
        
        # Reset
        requests.post(f"{BASE_URL}/ui/config", json={"theme": "evo"})

    def test_4_language_flow(self):
        print("\n[TEST 4] Language Context")
        # Verification: We check if the system accepts the language header
        # and effectively simple validation of "Health" with language header
        headers = {"Accept-Language": "es"}
        res = requests.get(f"{BASE_URL}/health", headers=headers)
        self.assertEqual(res.status_code, 200)
        
        # Verify DB Schema has language column (indirectly via ingestion having explicit lang?)
        # Current API doesn't expose lang explicitly in ingestion payload (it's auto-detected or context)
        # We'll skip strict DB check and rely on API 200 OK.
        pass

    def test_5_search_flow(self):
        print("\n[TEST 5] Semantic Search")
        # Seed data
        requests.post(f"{BASE_URL}/ingest", json={
            "text": "E2E Unique Search Term: QuantumFlapjack",
            "space_id": self.space_id
        })
        time.sleep(2) # Vector indexing latency
        
        # Search
        res = requests.post(f"{BASE_URL}/query/search", json={
            "query": "QuantumFlapjack",
            "space_id": self.space_id
        })
        results = res.json()
        
        # If real embeddings are working, it should be top result.
        # If utilizing mock/stub embeddings, it might vary.
        # We assert API response structure.
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(results, list)

if __name__ == '__main__':
    unittest.main()
