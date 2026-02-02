from typing import List
from pydantic import BaseModel, Field
import math

class SemanticProfile(BaseModel):
    """
    Represents the aggregated semantic state of an Idea.
    Decoupled from the Vector Store implementation.
    """
    centroid: List[float]
    fragment_count: int = 1
    # Potential future fields: variance, radius, keywords

    def update(self, new_vector: List[float]) -> 'SemanticProfile':
        """
        Pure function: Returns a NEW SemanticProfile with the updated centroid.
        Uses a moving average strategy.
        """
        if len(new_vector) != len(self.centroid):
            raise ValueError("Vector dimension mismatch")

        new_count = self.fragment_count + 1
        
        # Incremental Mean Formula: NewMean = OldMean + (NewVal - OldMean) / NewCount
        # Or simply: (OldSum + NewVal) / NewCount -> (OldMean * OldCount + NewVal) / NewCount
        
        new_centroid = []
        for i, old_val in enumerate(self.centroid):
            new_val = (old_val * self.fragment_count + new_vector[i]) / new_count
            new_centroid.append(new_val)
            
        return SemanticProfile(
            centroid=new_centroid,
            fragment_count=new_count
        )

class VectorUtils:
    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if len(v1) != len(v2):
            raise ValueError("Vector dimension mismatch")
            
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm_a = math.sqrt(sum(a * a for a in v1))
        norm_b = math.sqrt(sum(b * b for b in v2))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return dot_product / (norm_a * norm_b)
