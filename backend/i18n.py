"""
Multi-language support for backend API responses and LLM prompts.
Provides translations for ES (Spanish) and EN (English).
"""

from typing import Dict

# Translation dictionaries
translations: Dict[str, Dict[str, str]] = {
    "es": {
        # API Response Messages
        "space_created": "Espacio creado exitosamente",
        "space_updated": "Espacio actualizado exitosamente",
        "space_deleted": "Espacio eliminado exitosamente",
        "space_not_found": "Espacio no encontrado",
        
        "ingest_success": "Texto ingerido exitosamente",
        "ingest_batch_success": "Lote de textos ingeridos exitosamente",
        "ingest_error": "Error al ingerir texto",
        
        "product_created": "Producto creado exitosamente",
        "product_not_found": "Producto no encontrado",
        
        "search_no_results": "No se encontraron resultados",
        "search_error": "Error en la búsqueda",
        
        # Validation Errors
        "invalid_language": "Idioma inválido. Debe ser 'es' o 'en'",
        "missing_field": "Campo requerido faltante",
        "invalid_space_id": "ID de espacio inválido",
        
        # LLM Prompts - Ingest
        "llm_analyze_text": "Analiza el siguiente texto y extrae ideas clave:",
        "llm_generate_title": "Genera un título descriptivo para este fragmento:",
        "llm_extract_keywords": "Extrae palabras clave relevantes del texto:",
        
        # LLM Prompts - Products
        "llm_generate_blueprint": "Genera un blueprint estructurado para este producto:",
        "llm_generate_draft": "Genera un borrador detallado basado en este blueprint:",
    },
    "en": {
        # API Response Messages  
        "space_created": "Space created successfully",
        "space_updated": "Space updated successfully",
        "space_deleted": "Space deleted successfully",
        "space_not_found": "Space not found",
        
        "ingest_success": "Text ingested successfully",
        "ingest_batch_success": "Batch of texts ingested successfully",
        "ingest_error": "Error ingesting text",
        
        "product_created": "Product created successfully",
        "product_not_found": "Product not found",
        
        "search_no_results": "No results found",
        "search_error": "Search error",
        
        # Validation Errors
        "invalid_language": "Invalid language. Must be 'es' or 'en'",
        "missing_field": "Required field missing",
        "invalid_space_id": "Invalid space ID",
        
        # LLM Prompts - Ingest
        "llm_analyze_text": "Analyze the following text and extract key ideas:",
        "llm_generate_title": "Generate a descriptive title for this fragment:",
        "llm_extract_keywords": "Extract relevant keywords from the text:",
        
        # LLM Prompts - Products
        "llm_generate_blueprint": "Generate a structured blueprint for this product:",
        "llm_generate_draft": "Generate a detailed draft based on this blueprint:",
    }
}


def t(key: str, lang: str = "es") -> str:
    """
    Translate a key to the specified language.
    
    Args:
        key: Translation key
        lang: Language code ('es' or 'en'), defaults to 'es'
    
    Returns:
        Translated string, or the key itself if not found
    """
    # Validate language
    if lang not in ["es", "en"]:
        lang = "es"  # Default to Spanish
    
    # Get translation
    return translations.get(lang, {}).get(key, key)


def get_language_from_header(accept_language: str | None) -> str:
    """
    Extract language from Accept-Language header.
    
    Args:
        accept_language: Accept-Language header value
    
    Returns:
        Language code ('es' or 'en')
    """
    if not accept_language:
        return "es"
    
    # Parse first language from header (e.g., "en-US,en;q=0.9" -> "en")
    lang = accept_language.split(",")[0].split("-")[0].strip().lower()
    
    # Validate and return
    return lang if lang in ["es", "en"] else "es"
