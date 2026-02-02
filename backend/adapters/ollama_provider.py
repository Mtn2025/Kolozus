import httpx
import json
from typing import List, Dict, Any
from ports.ai_provider import AIProviderPort
import os

class OllamaProvider(AIProviderPort):
    def __init__(self, base_url: str = None, model: str = "llama3"):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3")
        self.embedding_model = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
        
        # Validation checks
        if not self.base_url.startswith("http"):
             # Simple heuristic check
             raise ValueError(f"Invalid OLLAMA_BASE_URL: {self.base_url}")

    async def generate_embedding(self, text: str) -> List[float]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                payload = {
                    "model": self.embedding_model,
                    "prompt": text
                }
                response = await client.post(f"{self.base_url}/api/embeddings", json=payload)
                response.raise_for_status()
                data = response.json()
                return data["embedding"]
        except Exception as e:
            print(f"[OllamaProvider] Error generating embedding: {e}")
            # Robustness: In a real pipeline we might fallback or raise. 
            # For now, let's re-raise to be handled by caller or fallback logic
            raise e

    async def synthesize(self, context: str, prompt_key: str) -> str:
        # Simple prompt construction for now
        # Ideally we load templates based on prompt_key
        
        system_prompt = "You are a Cognitive Engine. Analyze the context and provide a synthesis."
        user_prompt = f"Context: {context}\nTask: {prompt_key}"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client: # Longer timeout for generation
                payload = {
                    "model": self.model,
                    "prompt": user_prompt,
                    "system": system_prompt,
                    "stream": False
                }
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                response.raise_for_status()
                data = response.json()
                return data["response"]
        except Exception as e:
             print(f"[OllamaProvider] Error generating synthesis: {e}")
             raise e

    async def classify(self, text: str, categories: List[str]) -> str:
        # Not yet implemented for experimental phase
        return categories[0]
