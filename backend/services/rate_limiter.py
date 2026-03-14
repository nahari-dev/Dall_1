"""Rate limiter — Tier-based query limiting using Redis.

Enforces daily query limits based on the student's pricing tier:
  - Free:  5 queries/day
  - Pro:   49 queries/day
  - Elite: unlimited
"""

from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)

TIER_LIMITS: dict[str, int] = {
    "free": int(os.getenv("RATE_LIMIT_FREE", "5")),
    "pro": int(os.getenv("RATE_LIMIT_PRO", "49")),
    "elite": 0,  # 0 = unlimited
}


async def check_rate_limit(student_id: str, tier: str) -> tuple[bool, int]:
    """Check whether the student has remaining queries for today.

    Args:
        student_id: Student UUID.
        tier: Pricing tier (``free``, ``pro``, ``elite``).

    Returns:
        Tuple of (allowed, remaining_queries).
    """
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    if limit == 0:
        return True, -1  # unlimited

    try:
        from agents.backends.redis_state import get_rate_limit, set_rate_limit

        current = await get_rate_limit(student_id, tier)
        if current >= limit:
            logger.warning("Rate limit exceeded for student=%s tier=%s", student_id, tier)
            return False, 0

        await set_rate_limit(student_id, tier, current + 1)
        return True, limit - current - 1

    except Exception as exc:
        logger.warning("Rate limiter unavailable (allowing request): %s", exc)
        return True, -1


async def get_usage(student_id: str, tier: str) -> dict:
    """Get current usage stats for a student.

    Args:
        student_id: Student UUID.
        tier: Pricing tier.

    Returns:
        Dict with ``used``, ``limit``, ``remaining``.
    """
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    try:
        from agents.backends.redis_state import get_rate_limit

        used = await get_rate_limit(student_id, tier)
        return {
            "used": used,
            "limit": limit if limit > 0 else "unlimited",
            "remaining": (limit - used) if limit > 0 else "unlimited",
        }
    except Exception:
        return {"used": 0, "limit": limit if limit > 0 else "unlimited", "remaining": "unknown"}
