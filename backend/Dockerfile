FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml requirements.txt* ./
COPY backend/ ./backend/
COPY agents/ ./agents/
COPY data/ ./data/

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi>=0.111.0 \
    uvicorn[standard]>=0.30.0 \
    sse-starlette>=2.1.0 \
    deepagents>=0.4.0 \
    langgraph>=1.0.8 \
    langchain>=1.2.10 \
    langchain-anthropic>=1.3.0 \
    langchain-openai>=0.2.0 \
    langchain-core>=1.2.10 \
    langchain-community>=0.3.0 \
    sqlalchemy[asyncio]>=2.0.30 \
    asyncpg>=0.29.0 \
    alembic>=1.13.0 \
    redis>=5.0.0 \
    chromadb>=0.4.24 \
    pyjwt>=2.8.0 \
    passlib[bcrypt]>=1.7.4 \
    cryptography>=42.0.0 \
    python-multipart>=0.0.9 \
    boto3>=1.34.0 \
    pydantic[email]>=2.7.0 \
    pydantic-settings>=2.3.0 \
    python-dotenv>=1.0.0 \
    httpx>=0.27.0 \
    structlog>=24.1.0

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
