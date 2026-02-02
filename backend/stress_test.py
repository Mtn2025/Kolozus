import requests
import json
import random
import time

BASE_URL = "http://localhost:8000"

# Synthetic Dataset
DATASET = {
    # Topic 1: Neural Networks (Should Merge/Evolve)
    "clusters": [
        [
            "Neural networks inspired by biological neurons.",
            "Deep learning uses layered neural networks.",
            "Backpropagation adjusts weights in neural nets.",
            "Activation functions like ReLU are crucial.",
            "Neural networks require large datasets for training."
        ],
        # Topic 2: Quantum Physics (Should be Distinct)
        [
            "Quantum entanglement links particles instantly.",
            "Schrodinger's cat illustrates superposition.",
            "Quantum computing uses qubits not bits.",
            "Heisenberg uncertainty principle limits precision.",
            "Wave-function collapse occurs upon observation."
        ],
        # Topic 3: Cooking (Distinct)
        [
            "To make pasta start with boiling water.",
            "Olive oil and garlic are base for italian sauce.",
            "Al dente means pasta is firm to the bite.",
            "Basil adds freshness to tomato sauce.",
            "Parmesan cheese completes the dish."
        ]
    ],
    # Topic 4: Contradiction/Tension (Should target Neural Networks)
    "tension_triggers": [
        "However, neural networks are black boxes and unexplainable.",
        "But backpropagation is biologically implausible.",
        "Neural networks fail with small data, unlike humans."
    ]
}

def generate_payload():
    random.seed(42) # Ensure deterministic order for replay verification
    items = []
    
    # 1. Add Clusters (Sequential or Interleaved? Let's Interleave to make it harder)
    all_cluster_items = []
    for i, cluster in enumerate(DATASET["clusters"]):
        for text in cluster:
            all_cluster_items.append({"text": text, "source": f"cluster_{i}"})
    
    # Shuffle slightly to test robust retrieval
    random.shuffle(all_cluster_items)
    items.extend(all_cluster_items)
    
    # 2. Add Tension Triggers (Append at end to ensure targets exist)
    for text in DATASET["tension_triggers"]:
        items.append({"text": text, "source": "critic"})
        
    return items

def run_stress_test():
    items = generate_payload()
    print(f"--- Starting Stress Test (N={len(items)}) ---")
    
    payload = {"items": items}
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/ingest/bulk", json=payload)
        response.raise_for_status()
        results = response.json()
        duration = time.time() - start_time
        
        print(f"Completed in {duration:.2f}s ({len(items)/duration:.2f} items/s)")
        
        # Metrics
        actions = {}
        for r in results:
            act = r['decision']
            actions[act] = actions.get(act, 0) + 1
            print(f"[{act}] {r['text_preview']}... -> {r['target_idea']}")
            
        print("\n--- Metrics ---")
        for k, v in actions.items():
            print(f"{k}: {v}")
            
    except Exception as e:
        print(f"Test Failed: {e}")
        if 'response' in locals():
            print(response.text)

if __name__ == "__main__":
    run_stress_test()
