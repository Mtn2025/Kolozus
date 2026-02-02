import os
import json
import httpx
import logging
import time
from typing import List, Dict, Any, Optional
from ports.llm_provider import LLMProvider

logger = logging.getLogger("ollama.adapter")

class OllamaAdapter(LLMProvider):
    def __init__(self, base_url: str = None, model: str = "llama3.3"):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model
        self.embedding_model = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(f"{self.base_url}/api/version")
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Healthcheck failed: Ollama unreachable at {self.base_url}. {e}")
            return False

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        url = f"{self.base_url}/api/generate"
        start_time = time.time()
        
        valid_options = {"temperature", "num_ctx", "seed", "top_k", "top_p"}
        options = {k: v for k, v in kwargs.items() if k in valid_options}
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        if "format" in kwargs:
            payload["format"] = kwargs["format"]
            
        if options:
            payload["options"] = options

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                response_text = resp.json()["response"]
                
                duration = time.time() - start_time
                logger.info(json.dumps({
                    "provider": "ollama",
                    "model": self.model,
                    "latency_ms": round(duration * 1000, 2),
                    "prompt_chars": len(prompt),
                    "status": "success"
                }))
                return response_text
                
            except httpx.ConnectError:
                logger.error("Connection failed to Ollama.")
                raise ConnectionError(f"Could not connect to Ollama at {self.base_url}. Is it running?")
            except Exception as e:
                logger.error(f"Ollama generation error: {e}")
                raise RuntimeError(f"Ollama generation failed: {str(e)}")

    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        kwargs["format"] = "json"
        
        system_instruction = "You are a helpful assistant that outputs JSON."
        if schema:
            system_instruction += f"\nOutput must strictly follow this JSON schema: {json.dumps(schema)}"
            
        original_system = kwargs.get("system_prompt", "")
        combined_system = f"{original_system}\n{system_instruction}".strip()
        
        json_str = await self.generate_text(prompt, system_prompt=combined_system, **kwargs)
        
        try:
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            return json.loads(json_str)
        except json.JSONDecodeError:
            # If JSON is broken, we should log it
            logger.error(f"Broken JSON from Ollama: {json_str[:200]}...")
            # Allow fallback? For now, raise.
            raise ValueError("Failed to decode JSON from Ollama response")

    async def generate_embedding(self, text: str) -> List[float]:
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": self.embedding_model,
            "prompt": text
        }
        start_time = time.time()
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                
                duration = time.time() - start_time
                logger.info(json.dumps({
                    "provider": "ollama",
                    "action": "embed",
                    "model": self.embedding_model,
                    "latency_ms": round(duration * 1000, 2),
                    "text_chars": len(text)
                }))
                
                return resp.json()["embedding"]
            except Exception as e:
                logger.error(f"Ollama embedding failed: {e}")
                raise RuntimeError(f"Ollama embedding failed: {str(e)}")

    async def get_model_name(self) -> str:
        return self.model
