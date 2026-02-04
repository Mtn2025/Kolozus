class DomainError(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class EmbeddingError(DomainError):
    def __init__(self, message: str = "Failed to generate embedding", original_error: str = None):
        super().__init__(f"{message}: {original_error}" if original_error else message, "EMBEDDING_FAILED")

class ModelError(DomainError):
    def __init__(self, message: str = "AI Model failure", original_error: str = None):
        super().__init__(f"{message}: {original_error}" if original_error else message, "MODEL_FAILED")

class DatabaseError(DomainError):
    def __init__(self, message: str = "Database operation failed", original_error: str = None):
        super().__init__(f"{message}: {original_error}" if original_error else message, "DB_ERROR")

class NetworkError(DomainError):
    def __init__(self, message: str = "Network connectivity issue", original_error: str = None):
        super().__init__(f"{message}: {original_error}" if original_error else message, "NETWORK_ERROR")
