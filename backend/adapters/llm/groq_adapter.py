import json
import logging
import time
from typing import List, Dict, Any, Optional
from groq import AsyncGroq, APIConnectionError
from ports.llm_provider import LLMProvider

logger = logging.getLogger("groq.adapter")

class GroqAdapter(LLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.client = AsyncGroq(api_key=api_key)
        self.model = model

    async def check_health(self) -> bool:
        try:
            # Lightweight call to verify connection
            await self.client.models.list()
            return True
        except APIConnectionError:
            logger.error("Healthcheck failed: Groq API unreachable.")
            return False
        except Exception as e:
            logger.error(f"Healthcheck failed: {e}")
            return False

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        start_time = time.time()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        if "temperature" not in kwargs:
            kwargs["temperature"] = 0.7
            
        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                **kwargs
            )
            duration = time.time() - start_time
            # Structured Log
            logger.info(json.dumps({
                "provider": "groq",
                "model": self.model,
                "latency_ms": round(duration * 1000, 2),
                "prompt_chars": len(prompt),
                "completion_tokens": completion.usage.completion_tokens if completion.usage else 0,
                "status": "success"
            }))
            return completion.choices[0].message.content
            
        except Exception as e:
            logger.error(json.dumps({
                "provider": "groq",
                "model": self.model,
                "status": "error",
                "error": str(e)
            }))
            raise e

    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        kwargs["response_format"] = {"type": "json_object"}
        original_system_prompt = kwargs.get("system_prompt", "")
        system_instruction = "You are a helpful assistant that outputs JSON."
        if schema:
            system_instruction += f"\nOutput must strictly follow this JSON schema: {json.dumps(schema)}"
        
        combined_system = f"{original_system_prompt}\n{system_instruction}".strip()
        
        json_str = await self.generate_text(prompt, system_prompt=combined_system, **kwargs)
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            raise ValueError(f"Failed to decode JSON from Groq response: {json_str}")

    async def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("Groq does not support embeddings.")

    async def get_model_name(self) -> str:
        return self.model
