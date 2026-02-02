from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProviderPort(ABC):
    
    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generates a vector embedding for the given text."""
        pass

    @abstractmethod
    async def classify_text(self, text: str, categories: List[str]) -> str:
        """Classifies text into one of the provided categories."""
        pass

    @abstractmethod
    async def synthesize(self, context: str, prompt: str, language: str = "en") -> str:
        """Generates a text synthesis based on context and prompt."""
        pass

    @abstractmethod
    async def generate_json(self, context: str, prompt: str, language: str = "en") -> Dict[str, Any]:
        """Generates a structured JSON response based on context and prompt."""
        pass
