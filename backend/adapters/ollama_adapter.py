import os
import requests
from typing import List, Dict, Any
from ports.ai_provider import AIProviderPort

class OllamaAdapter(AIProviderPort):
    def __init__(self, host: str = None, model_generate: str = "llama3", model_embed: str = "nomic-embed-text"):
        self.host = host or os.getenv("OLLAMA_BASE_URL")
        self.model_generate = os.getenv("OLLAMA_MODEL_GENERATE", model_generate)
        self.model_embed = os.getenv("OLLAMA_MODEL_EMBED", model_embed)
        print(f"[OllamaAdapter] Initialized. Host: {self.host}, Models: {self.model_generate}, {self.model_embed}")

    async def get_embedding(self, text: str) -> List[float]:
        url = f"{self.host}/api/embeddings"
        payload = {
            "model": self.model_embed,
            "prompt": text
        }
        try:
            resp = requests.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]
        except Exception as e:
            print(f"[OllamaAdapter] Error getting embedding: {e}")
            # Fallback or re-raise depending on strictness
            raise e

    async def analyze_fragment(self, text: str) -> Dict[str, Any]:
        """
        Extracts metadata or categorizes the fragment.
        """
        # Simple implementation using generate for now
        prompt = f"Analyze this text and return JSON with keys 'topics' (list) and 'sentiment' (str): {text}"
        response_text = await self._generate(prompt, json_mode=True)
        # Assuming response is JSON string, parsing would be needed here. 
        # For prototype, returning mock or parsed if simple.
        return {"raw_analysis": response_text}

    async def synthesize_idea(self, fragments: List[str]) -> str:
        combined = "\n".join(f"- {f}" for f in fragments)
        prompt = f"Synthesize these fragments into a coherent idea description:\n{combined}"
        return await self._generate(prompt)

    async def generate_reasoning(self, context: str) -> str:
        return await self._generate(f"Explain the reasoning for this connection: {context}")

    async def generate_json(self, context: str, prompt: str) -> Dict[str, Any]:
        full_prompt = f"CONTEXT:\n{context}\n\nTASK:\n{prompt}\n\nRespond with valid JSON."
        response_text = await self._generate(full_prompt, json_mode=True)
        # Parse JSON string to dict
        import json
        try:
             # Sanitize markdown code blocks if present
             if "```json" in response_text:
                 response_text = response_text.split("```json")[1].split("```")[0]
             elif "```" in response_text:
                 response_text = response_text.split("```")[1].split("```")[0]
             return json.loads(response_text)
        except Exception as e:
             print(f"[OllamaAdapter] JSON Parse Error: {e}, Raw: {response_text}")
             return {}

    async def _generate(self, prompt: str, json_mode: bool = False) -> str:
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model_generate,
            "prompt": prompt,
            "stream": False
        }
        if json_mode:
            payload["format"] = "json"
            
        try:
            resp = requests.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["response"]
        except Exception as e:
            print(f"[OllamaAdapter] Error generating text: {e}")
            return "Error generating response."
