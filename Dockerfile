# Multi-stage Dockerfile for utility tasks and development
# Use: docker build -t dall-agents-util . && docker run -it dall-agents-util

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY backend/ ./backend/
COPY agents/ ./agents/
COPY data/ ./data/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Default command - can be overridden for specific tasks
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "pytest"]
