FROM python:3.11-slim

WORKDIR /app

# System dependencies removed to avoid network timeouts. 
# We use psycopg2-binary and python-based healthchecks.

# Install Python dependencies
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Production mode (no --reload)
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
