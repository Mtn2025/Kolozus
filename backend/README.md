# Kolozus Backend (FastAPI)

## Development
1. Create venv: `python -m venv .venv`
2. Activate: `.venv\Scripts\activate`
3. Install: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --reload`

## Structure
- `adapters/`: External interfaces (API, DB, AI)
- `domain/`: Core logic and entities
# Kolozus
> Cognitive Architecture for Editorial Evolution

## Local Development
By default, the project runs in **MockAI Mode**. This ensures you can develop without external API keys or heavy local LLMs (Ollama).
- `AI_PROVIDER=mock` in `.env` enables deterministic responses.
- `GROQ_API_KEY` can be set to any dummy value locally.

To use real AI (Production):
1. Set `AI_PROVIDER=groq` or `ollama`.
2. Provide valid valid keys/URLs.
s
- `ports/`: Interfaces definitions
- `infrastructure/`: Config and wiring
