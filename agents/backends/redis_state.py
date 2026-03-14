"""Redis state backend — real-time session state persistence.

Stores the in-flight LangGraph state for each active student session so
that conversations survive WebSocket reconnections and can be resumed.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import redis.asyncio as aioredis

from agents.config import settings

logger = logging.getLogger(__name__)

_pool: aioredis.Redis | None = None

SESSION_PREFIX = "dall:session:"
SESSION_TTL = 60 * 60 * 24  # 24 hours


async def get_redis() -> aioredis.Redis:
    """Return a shared async Redis connection pool."""
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _pool


async def save_session_state(session_id: str, state: dict[str, Any]) -> None:
    """Persist a session state snapshot to Redis.

    Args:
        session_id: Unique session identifier.
        state: The DallState dict to store (serialised as JSON).
    """
    r = await get_redis()
    key = f"{SESSION_PREFIX}{session_id}"

    # Messages contain LangChain objects — serialise minimally
    serialisable = _make_serialisable(state)
    await r.set(key, json.dumps(serialisable), ex=SESSION_TTL)
    logger.debug("Saved session state: %s", key)


async def load_session_state(session_id: str) -> dict[str, Any] | None:
    """Load a session state from Redis.

    Args:
        session_id: Unique session identifier.

    Returns:
        The stored state dict, or ``None`` if not found / expired.
    """
    r = await get_redis()
    key = f"{SESSION_PREFIX}{session_id}"
    raw = await r.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def delete_session_state(session_id: str) -> None:
    """Remove a session state from Redis."""
    r = await get_redis()
    await r.delete(f"{SESSION_PREFIX}{session_id}")


async def set_rate_limit(student_id: str, tier: str, count: int, ttl: int = 86400) -> None:
    """Set or update the daily query count for rate limiting.

    Args:
        student_id: Student identifier.
        tier: Pricing tier (``free``, ``pro``, ``elite``).
        count: Current query count.
        ttl: Seconds until the counter resets (default 24h).
    """
    r = await get_redis()
    key = f"dall:rate:{student_id}:{tier}"
    await r.set(key, count, ex=ttl)


async def get_rate_limit(student_id: str, tier: str) -> int:
    """Get the current daily query count for a student."""
    r = await get_redis()
    key = f"dall:rate:{student_id}:{tier}"
    val = await r.get(key)
    return int(val) if val else 0


def _make_serialisable(state: dict) -> dict:
    """Convert LangChain message objects to plain dicts for JSON storage."""
    result = {}
    for k, v in state.items():
        if k == "messages":
            result[k] = [
                {
                    "type": getattr(m, "type", "unknown"),
                    "content": getattr(m, "content", str(m)),
                }
                for m in (v or [])
            ]
        elif isinstance(v, dict):
            result[k] = v
        elif isinstance(v, list):
            result[k] = v
        else:
            result[k] = v
    return result
