from typing import List
from ports.ai_provider import AIProviderPort

class MockAIProvider(AIProviderPort):
    def __init__(self):
        # Deterministic mock data
        self._mock_vector = [0.1] * 1536
    
    async def generate_embedding(self, text: str) -> List[float]:
        import random
        import math
        
        # Base vectors for clusters (using deterministic random for base)
        def get_base_vector(seed_key):
            rng = random.Random(seed_key)
            return [rng.uniform(-1.0, 1.0) for _ in range(1536)]
            
        # Determine cluster
        text_lower = text.lower()
        if "neural" in text_lower or "learning" in text_lower:
            base = get_base_vector("ai_cluster")
        elif "quantum" in text_lower or "physics" in text_lower:
            base = get_base_vector("physics_cluster")
        elif "cook" in text_lower or "pasta" in text_lower:
            base = get_base_vector("cooking_cluster")
        else:
            base = get_base_vector("misc_" + text[:5])
            
        # Add noise based on text content to simulate variations
        # noise = small random vector derived from text hash
        text_seed = sum(ord(c) for c in text)
        rng_noise = random.Random(text_seed)
        
        # Mix 95% base + 5% noise to ensure high similarity (>0.9) within cluster
        # and low similarity between clusters.
        vector = []
        for b in base:
            noise = (rng_noise.random() - 0.5) * 0.1 # +/- 0.05
            val = b + noise
            vector.append(val)
            
        return vector

    async def classify_text(self, text: str, categories: List[str]) -> str:
        # Simple deterministic classification
        for cat in categories:
            if cat.lower() in text.lower():
                return cat
        return categories[0]

    async def synthesize(self, context: str, prompt: str) -> str:
        # Echo context to allow testing keywords in synthesis
        return f"[MOCK SYNTHESIS] Based on {len(context)} chars context. Content: {context[:50]}..."

    async def generate_json(self, context: str, prompt: str) -> Dict[str, Any]:
        # Return a mock structure for Blueprinting
        return {
            "sections": [
                {
                    "title": "Module 1: Foundations (Mock)",
                    "content": "Intro to the topic based on context.",
                    "subsections": [
                        {"title": "Lesson 1.1: Core Concepts", "content": "Deep dive into A."},
                        {"title": "Lesson 1.2: History", "content": "Timeline of events."}
                    ]
                },
                {
                    "title": "Module 2: Advanced Topics (Mock)",
                    "content": "Complex synthesis.",
                    "subsections": []
                }
            ]
        }
