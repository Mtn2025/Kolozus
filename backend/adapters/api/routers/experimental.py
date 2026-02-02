from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from adapters.ollama_provider import OllamaProvider
from typing import Dict, Any
import os

router = APIRouter(
    prefix="/ai/experimental",
    tags=["experimental"],
)

class OllamaTestRequest(BaseModel):
    text: str
    task: str = "summarize" # summarize, embed, ping
    target_url: str | None = None # Allow dynamic injection for testing

@router.post("/ollama-test")
async def test_ollama_connection(req: OllamaTestRequest):
    """
    Experimental endpoint to test remote Ollama connectivity.
    Isolated from main pipeline.
    """
    # Priority: Injected URL > Env Var
    base_url = req.target_url or os.getenv("OLLAMA_BASE_URL")
    
    if not base_url:
        return {
            "status": "config_error",
            "message": "No URL provided in request (target_url) or environment (OLLAMA_BASE_URL)"
        }

    provider = OllamaProvider(base_url=base_url)
    
    results = {
        "config": {
            "url": base_url,
            "model": provider.model,
            "embed_model": provider.embedding_model
        },
        "status": "pending"
    }

    try:
        if req.task == "ping":
            # Simple version check (if API supported) or root check
            # Ollama root usually returns "Ollama is running"
            import httpx
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(base_url)
                results["response"] = resp.text
                results["status"] = "success" if resp.status_code == 200 else "error"
                
        elif req.task == "embed":
            vector = await provider.generate_embedding(req.text)
            results["vector_dim"] = len(vector)
            results["vector_preview"] = vector[:5]
            results["status"] = "success"
            
        else: # summarize/synthesize
            synthesis = await provider.synthesize(req.text, req.task)
            results["synthesis"] = synthesis
            results["status"] = "success"
            
    except Exception as e:
        results["status"] = "failed"
        results["error"] = str(e)
        
    return results
