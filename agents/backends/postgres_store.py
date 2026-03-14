"""PostgreSQL store backend — long-term persistence for student data.

Handles durable storage of student profiles, quiz history, analytics,
and all data that must survive beyond a single session.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from agents.config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(settings.database_url, echo=False, pool_size=10, max_overflow=20)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    """Yield an async SQLAlchemy session."""
    async with async_session_factory() as session:
        return session


async def get_student_profile(student_id: str) -> dict[str, Any] | None:
    """Load a student's aggregated profile from the database.

    Args:
        student_id: Student UUID.

    Returns:
        Profile dict or ``None`` if student not found.
    """
    async with async_session_factory() as session:
        result = await session.execute(
            text("""
                SELECT s.id, s.name, s.email, s.tier, s.preferences_json,
                       COALESCE(AVG(qs.score), 0) as avg_score,
                       COUNT(qs.id) as total_quizzes
                FROM students s
                LEFT JOIN quiz_sessions qs ON qs.student_id = s.id
                WHERE s.id = :sid
                GROUP BY s.id
            """),
            {"sid": student_id},
        )
        row = result.first()
        if not row:
            return None

        return {
            "student_id": str(row.id),
            "name": row.name,
            "email": row.email,
            "tier": row.tier,
            "preferences": row.preferences_json,
            "average_score": float(row.avg_score),
            "total_quizzes": row.total_quizzes,
        }


async def get_topic_scores(student_id: str) -> list[dict[str, Any]]:
    """Get per-topic scores for a student.

    Args:
        student_id: Student UUID.

    Returns:
        List of ``{topic, score, last_updated}`` dicts.
    """
    async with async_session_factory() as session:
        result = await session.execute(
            text("""
                SELECT topic, score, last_updated
                FROM student_topic_scores
                WHERE student_id = :sid
                ORDER BY score ASC
            """),
            {"sid": student_id},
        )
        return [
            {"topic": row.topic, "score": float(row.score), "last_updated": str(row.last_updated)}
            for row in result.fetchall()
        ]


async def save_quiz_result(
    student_id: str,
    topic: str,
    score: float,
    duration: int,
    answers: list[dict],
) -> str:
    """Persist a completed quiz session.

    Args:
        student_id: Student UUID.
        topic: Primary topic of the quiz.
        score: Percentage score achieved.
        duration: Total time in seconds.
        answers: List of answer dicts.

    Returns:
        The new quiz session ID.
    """
    import json
    import uuid

    session_id = str(uuid.uuid4())

    async with async_session_factory() as session:
        await session.execute(
            text("""
                INSERT INTO quiz_sessions (id, student_id, topic, score, duration)
                VALUES (:id, :sid, :topic, :score, :dur)
            """),
            {
                "id": session_id,
                "sid": student_id,
                "topic": topic,
                "score": score,
                "dur": duration,
            },
        )

        for ans in answers:
            await session.execute(
                text("""
                    INSERT INTO quiz_answers (id, session_id, question_id, selected, correct, time_spent)
                    VALUES (:id, :sess, :qid, :sel, :cor, :ts)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "sess": session_id,
                    "qid": ans.get("question_id", ""),
                    "sel": ans.get("selected", ""),
                    "cor": ans.get("correct", False),
                    "ts": ans.get("time_spent", 0),
                },
            )

        await session.commit()

    logger.info("Saved quiz session %s for student %s (score=%.1f%%)", session_id, student_id, score)
    return session_id


async def update_topic_score(student_id: str, topic: str, new_score: float) -> None:
    """Update a student's score for a specific topic (running average).

    Args:
        student_id: Student UUID.
        topic: Topic name.
        new_score: Latest score to incorporate.
    """
    async with async_session_factory() as session:
        await session.execute(
            text("""
                INSERT INTO student_topic_scores (student_id, topic, score, last_updated)
                VALUES (:sid, :topic, :score, NOW())
                ON CONFLICT (student_id, topic)
                DO UPDATE SET
                    score = (student_topic_scores.score + :score) / 2,
                    last_updated = NOW()
            """),
            {"sid": student_id, "topic": topic, "score": new_score},
        )
        await session.commit()
