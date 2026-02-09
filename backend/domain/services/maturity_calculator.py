from typing import List
from datetime import datetime
from domain.models import Idea, Fragment

class MaturityCalculator:
    """
    Calcula la madurez de una Idea basándose en métricas objetivas.
    Score de 0-100.
    """
    
    @staticmethod
    def calculate(idea: Idea, fragments: List[Fragment], versions_count: int = 0) -> int:
        """
        Calculate maturity score for an idea.
        
        Args:
            idea: The Idea instance
            fragments: List of fragments associated with this idea
            versions_count: Number of versions (consolidations) the idea has
            
        Returns:
            Maturity score from 0-100
        """
        score = 0
        
        # 1. Fragment count (max 40 points)
        # More fragments = more complete idea
        fragment_score = min(len(fragments) * 4, 40)
        score += fragment_score
        
        # 2. Version count (max 30 points)
        # More versions = more consolidation/refinement
        version_score = min(versions_count * 6, 30)
        score += version_score
        
        # 3. Age in days (max 20 points)
        # Older ideas have had more time to mature
        days_old = (datetime.utcnow() - idea.created_at).days
        age_score = min(days_old * 2, 20)
        score += age_score
        
        # 4. Domain classification (10 points)
        # Ideas with classified domains are more refined
        if idea.domain and idea.domain != "Unclassified":
            score += 10
        
        return min(score, 100)
    
    @staticmethod
    def get_status_label(score: int) -> str:
        """
        Get human-readable status based on score.
        
        Args:
            score: Maturity score (0-100)
            
        Returns:
            Status label: germinal, growing, or mature
        """
        if score < 30:
            return "germinal"
        elif score < 70:
            return "growing"
        else:
            return "mature"
    
    @staticmethod
    def get_emoji(score: int) -> str:
        """
        Get emoji representation of maturity.
        
        Args:
            score: Maturity score (0-100)
            
        Returns:
            Emoji string
        """
        if score < 30:
            return "🌱"  # Seedling
        elif score < 70:
            return "🌿"  # Herb
        else:
            return "🌳"  # Tree
    
    @staticmethod
    def is_ready_for_product(score: int, min_score: int = 60) -> bool:
        """
        Check if idea is mature enough to create a product.
        
        Args:
            score: Maturity score (0-100)
            min_score: Minimum score required (default 60)
            
        Returns:
            True if ready, False otherwise
        """
        return score >= min_score
