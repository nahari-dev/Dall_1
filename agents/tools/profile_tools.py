"""Student profile tools for the student-profile-agent."""

from __future__ import annotations

import json
import logging

from langchain_core.tools import tool

logger = logging.getLogger(__name__)

# Default profile for new / unknown students
_DEFAULT_PROFILE: dict = {
    "proficiency_level": "intermediate",
    "weak_topics": ["Oral Pathology", "Pharmacology"],
    "strong_topics": ["Operative Dentistry"],
    "recommended_difficulty": "medium",
    "learning_style": "visual",
    "total_quizzes_taken": 0,
    "average_score": 0.0,
    "study_streak_days": 0,
}


@tool
def profile_reader(student_id: str) -> str:
    """Load a student's proficiency profile from storage.

    Args:
        student_id: The student's unique identifier.

    Returns:
        JSON object with the student's full profile including proficiency level,
        weak topics, strong topics, learning style, and quiz history.
    """
    # In production: reads from PostgreSQL via StoreBackend
    # For now: returns a sensible default
    logger.info("Loading profile for student=%s", student_id)
    profile = dict(_DEFAULT_PROFILE)
    profile["student_id"] = student_id

    # Adjust based on quiz history (placeholder logic)
    if profile["average_score"] >= 80:
        profile["proficiency_level"] = "advanced"
        profile["recommended_difficulty"] = "hard"
    elif profile["average_score"] >= 50:
        profile["proficiency_level"] = "intermediate"
        profile["recommended_difficulty"] = "medium"
    else:
        profile["proficiency_level"] = "beginner"
        profile["recommended_difficulty"] = "easy"

    return json.dumps(profile)


@tool
def proficiency_updater(student_id: str, topic: str, new_score: float) -> str:
    """Update a student's proficiency score for a specific topic.

    Args:
        student_id: The student's unique identifier.
        topic: The topic name to update.
        new_score: The new score (0-100) to incorporate.

    Returns:
        JSON confirmation with updated proficiency data.
    """
    logger.info(
        "Updating proficiency for student=%s, topic=%s, score=%.1f",
        student_id, topic, new_score,
    )
    # In production: updates student_topic_scores table via StoreBackend
    return json.dumps({
        "student_id": student_id,
        "topic": topic,
        "new_score": new_score,
        "updated": True,
        "message": f"Proficiency for {topic} updated to {new_score}%",
    })


@tool
def learning_style_detector(student_id: str, interaction_history: str = "[]") -> str:
    """Detect the student's learning style from interaction patterns.

    Args:
        student_id: The student's unique identifier.
        interaction_history: JSON array of recent interaction summaries.

    Returns:
        JSON object with detected learning style and confidence.
    """
    # In production: analyses quiz answer patterns, hint usage, time-on-task
    return json.dumps({
        "student_id": student_id,
        "detected_style": "visual",
        "confidence": 0.75,
        "recommendation": "Use diagrams and visual aids when explaining concepts",
        "alternative_styles": ["reading_writing", "kinesthetic"],
    })
