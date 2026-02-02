from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class LLMProvider(ABC):
    """
    Standard interface for LLM interactions in the Editorial Engine.
    Supports text generation and embeddings.
    """

    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """
        Generates a text completion for the given prompt.
        
        Args:
            prompt: The user prompt.
            system_prompt: Optional instruction for the system behavior.
            **kwargs: Provider-specific parameters (e.g., temperature, max_tokens).
        """
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for the given text.
        """
        pass

    @abstractmethod
    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """
        Generates a structured JSON response.
        """
        pass

    @abstractmethod
    async def get_model_name(self) -> str:
        """Returns the ID of the model currently in use."""
        pass
