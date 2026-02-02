FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port (documentation only, actual port determined by Coolify via PORT env var)
EXPOSE 8000

# Command to run the application using shell to expand variables
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --reload"]
