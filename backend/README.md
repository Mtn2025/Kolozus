# Kolozus Backend (FastAPI)

## Development
1. Create venv: `python -m venv .venv`
2. Activate: `.venv\Scripts\activate`
3. Install: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --reload`

## Structure
- `adapters/`: External interfaces (API, DB, AI)
- `domain/`: Core logic and entities
- `ports/`: Interfaces definitions
- `infrastructure/`: Config and wiring
