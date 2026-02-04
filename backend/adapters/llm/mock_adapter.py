from typing import List, Optional, Dict, Any
from ports.llm_provider import LLMProvider
import random
import json

class MockAdapter(LLMProvider):
    def __init__(self, model: str = "mock-gpt"):
        self.model = model
        self._mock_vector = [0.1] * 1536

    async def get_model_name(self) -> str:
        return self.model

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """
        Deterministic mock text generation.
        """
        # Simple echo or heuristic based on prompt keywords to simulate "logic"
        prompt_lower = prompt.lower()
        if "classify" in prompt_lower:
            # Classification Mock
            if "neural" in prompt_lower: return "Artificial Intelligence"
            if "cook" in prompt_lower: return "Cooking"
            if "quantum" in prompt_lower: return "Physics"
            return "General"
        
        return f"[MOCK] Generated response for: {prompt[:30]}..."

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Deterministic mock embedding.
        """
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
        text_seed = sum(ord(c) for c in text)
        rng_noise = random.Random(text_seed)
        
        vector = []
        for b in base:
            noise = (rng_noise.random() - 0.5) * 0.1 # +/- 0.05
            val = b + noise
            vector.append(val)
            
        return vector

    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """
        Return structured mock data.
        """
        # Blueprint Mock
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
