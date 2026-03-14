"""Pytest configuration for Dall Academy tests."""

from __future__ import annotations

import os
import sys

# Add the project root to Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Set required environment variables for testing
os.environ.setdefault("LLM_MODEL", "anthropic:claude-sonnet-4-20250514")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://dall_user:dall_password@localhost:5432/dall_academy")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test-placeholder")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-placeholder")
