import os
from typing import List, Dict, Any, Optional
from uuid import UUID
from ports.ai_provider import AIProviderPort
from ports.llm_provider import LLMProvider
from adapters.llm.groq_adapter import GroqAdapter
from adapters.llm.ollama_adapter import OllamaAdapter
from adapters.llm.mock_adapter import MockAdapter
from domain.services.ai_config_service import AIConfigService, AIModelConfig

class CompositeAIProvider(AIProviderPort):
    def __init__(self, config_service: AIConfigService):
        # We inject the config service (scoped to request usually)
        # or we instantiate it if passed inside the method
        # BUT standard pattern for stateless singleton provider:
        # Pass DB/User Context in method args OR use request-scoped dependency injection.
        # Since 'get_ai_provider' in fastAPI can be request-scoped, we can inject DB session into it.
        self.config_service = config_service
        self._groq_api_key = os.getenv("GROQ_API_KEY", "")
        self._force_mock = os.getenv("AI_PROVIDER") == "mock"

    def _get_provider(self, config: AIModelConfig) -> LLMProvider:
        # Factories method - Lightweight enough to recreate or we could cache safely if no state involved
        if self._force_mock:
            return MockAdapter()

        if config.provider == "groq":
            if not self._groq_api_key:
                print(f"[CompositeAI] Warning: GROQ_API_KEY not set. {config.model_name} might fail.")
            return GroqAdapter(api_key=self._groq_api_key, model=config.model_name)
        
        elif config.provider == "ollama":
            return OllamaAdapter(model=config.model_name)
            
        else:
            return OllamaAdapter(model="llama3")

    async def generate_embedding(self, text: str, user_id: Optional[UUID] = None) -> List[float]:
        profile = self.config_service.get_config(user_id)
        
        # Check environment setting to avoid defaulting to dead Ollama
        env_provider = os.getenv("AI_PROVIDER", "ollama")
        
        if hasattr(profile, 'embedding'):
             config = profile.embedding
        else:
             # Smart Default: If AI_PROVIDER is mock or groq (which has no embeddings), use mock embeddings
             # Only use Ollama if explicitly set or if we are sure.
             if env_provider == "ollama":
                 config = AIModelConfig(provider="ollama", model_name="nomic-embed-text-v2-moe:latest")
             else:
                 # Fallback to mock for stability - Groq doesn't do embeddings
                 config = AIModelConfig(provider="mock", model_name="random-projection")
             
        # Force mock if explicitly configured
        if config.provider == "mock" or env_provider == "mock":
            return await MockAdapter().generate_embedding(text)
        
        # Try Ollama with fallback to Mock on failure
        if config.provider == "ollama":
            try:
                provider = self._get_provider(config)
                return await provider.generate_embedding(text)
            except Exception as e:
                # Ollama failed (404, connection refused, etc.) - fallback to Mock
                print(f"[CompositeAI] Ollama embedding failed: {str(e)}. Falling back to MockAdapter.")
                return await MockAdapter().generate_embedding(text)
        
        # For other providers (shouldn't happen for embeddings, but safe default)
        provider = self._get_provider(config)
        return await provider.generate_embedding(text)

    async def synthesize(self, context: str, prompt: str, user_id: Optional[UUID] = None, language: str = "en") -> str:
        profile = self.config_service.get_config(user_id)
        provider = self._get_provider(profile.drafter)
        
        lang_instruction = "INSTRUCTION: Output strictly in English." if language == "en" else "INSTRUCCIÓN: Responde estrictamente en Español."
        
        full_prompt = f"{lang_instruction}\n\nContext:\n{context}\n\nTask:\n{prompt}"
        return await provider.generate_text(full_prompt)

    async def generate_json(self, context: str, prompt: str, user_id: Optional[UUID] = None, language: str = "en") -> Dict[str, Any]:
        profile = self.config_service.get_config(user_id)
        provider = self._get_provider(profile.blueprinter)
        
        full_prompt = f"Context:\n{context}\n\nTask:\n{prompt}"
        return await provider.generate_json(full_prompt)

    async def classify_text(self, text: str, categories: List[str], user_id: Optional[UUID] = None) -> str:
        profile = self.config_service.get_config(user_id)
        provider = self._get_provider(profile.blueprinter)
        
        prompt = (
            f"Classify the following text into exactly one of these categories: {', '.join(categories)}.\n"
            f"Text content: \"{text[:1000]}...\"\n"
            f"Reply ONLY with the category name, nothing else."
        )
        
        result = await provider.generate_text(prompt, temperature=0.1)
        cleaned = result.strip().strip('"').replace(".", "")
        
        for cat in categories:
            if cat.lower() in cleaned.lower():
                return cat
        return cleaned
