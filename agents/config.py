"""Central configuration for the Deep Agents engine.

Loads environment variables and exposes typed settings used by the supervisor,
subagents, middleware, and storage backends.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings


class AgentConfig(BaseSettings):
    """Typed configuration consumed by every agent and backend."""

    # ── LLM Providers ─────────────────────────────────────────────────────
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""

    # Model identifier in "provider:model" format (e.g. "openai:gpt-4o",
    # "anthropic:claude-sonnet-4-20250514", "google-genai:gemini-2.0-flash").
    # Passed directly to ``create_deep_agent`` which resolves the provider via
    # ``langchain.chat_models.init_chat_model``.
    llm_model: str = "anthropic:claude-sonnet-4-20250514"

    embedding_model: str = "text-embedding-3-small"

    # ── Database ──────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://dall_user:dall_password@localhost:5432/dall_academy"

    # ── Redis ─────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── ChromaDB ──────────────────────────────────────────────────────────
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    chroma_collection: str = "dental_knowledge"

    # ── S3 / MinIO ────────────────────────────────────────────────────────
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket_name: str = "dall-academy"

    # ── RAG ───────────────────────────────────────────────────────────────
    rag_top_k: int = 8
    rag_relevance_threshold: float = 0.65

    # ── Exam ──────────────────────────────────────────────────────────────
    sdle_pass_score: int = 70
    default_quiz_time_per_question: int = 90  # seconds

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


# Singleton used throughout the package
settings = AgentConfig()
