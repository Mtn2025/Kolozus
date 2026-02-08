from fastapi import Request
from fastapi.responses import JSONResponse

class APIError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "api_error", # Generic type, or specific based on code? User asked for "error": "not_found" or "validation_error"
            # Let's map code to error type if possible, or just use a convention.
            # User example 1: error="not_found", code="SPACE_NOT_FOUND" 
            # User example 2: error="validation_error", code="TEXT_REQUIRED"
            "error": "not_found" if exc.status_code == 404 else "validation_error",
            "message": exc.message,
            "code": exc.code
        }
    )
