"""Readiness assessment tools for the readiness-agent."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta

from langchain_core.tools import tool

from agents.config import settings

logger = logging.getLogger(__name__)

# SDLE topic weights
_TOPIC_WEIGHTS: dict[str, float] = {
    "Operative Dentistry": 0.18,
    "Oral Pathology": 0.15,
    "Prosthodontics": 0.14,
    "Orthodontics": 0.10,
    "Endodontics": 0.10,
    "Periodontics": 0.09,
    "Oral Surgery": 0.08,
    "Pediatric Dentistry": 0.07,
    "Pharmacology": 0.05,
    "Radiology": 0.04,
}

# Mock per-topic scores (in production, from database)
_MOCK_TOPIC_SCORES: dict[str, float] = {
    "Operative Dentistry": 75.0,
    "Oral Pathology": 45.0,
    "Prosthodontics": 60.0,
    "Orthodontics": 55.0,
    "Endodontics": 70.0,
    "Periodontics": 65.0,
    "Oral Surgery": 50.0,
    "Pediatric Dentistry": 72.0,
    "Pharmacology": 40.0,
    "Radiology": 68.0,
}


@tool
def readiness_calculator(student_id: str) -> str:
    """Calculate overall SDLE exam readiness as a weighted percentage.

    Args:
        student_id: The student's unique identifier.

    Returns:
        JSON object with overall readiness percentage, pass score, and status.
    """
    pass_score = settings.sdle_pass_score
    overall = sum(
        _MOCK_TOPIC_SCORES.get(t, 0) * w for t, w in _TOPIC_WEIGHTS.items()
    )

    return json.dumps({
        "student_id": student_id,
        "overall_readiness_pct": round(overall, 1),
        "pass_score": pass_score,
        "on_track": overall >= pass_score,
        "status": "ready" if overall >= pass_score else "not_ready",
    })


@tool
def gap_analyzer(student_id: str) -> str:
    """Identify per-topic gaps between current scores and the pass target.

    Args:
        student_id: The student's unique identifier.

    Returns:
        JSON array of topics sorted by gap size (most work needed first).
    """
    pass_score = settings.sdle_pass_score
    breakdown = []

    for topic, score in _MOCK_TOPIC_SCORES.items():
        gap = max(0, pass_score - score)
        status = "strong" if score >= pass_score else "needs_work" if score >= 50 else "weak"
        breakdown.append({
            "topic": topic,
            "score": score,
            "weight": _TOPIC_WEIGHTS.get(topic, 0.0),
            "status": status,
            "gap": gap,
        })

    breakdown.sort(key=lambda x: x["gap"], reverse=True)
    return json.dumps(breakdown)


@tool
def study_plan_generator(student_id: str, weak_topics_json: str = "[]") -> str:
    """Generate a day-by-day study plan with spaced repetition.

    Args:
        student_id: The student's unique identifier.
        weak_topics_json: JSON array of topic breakdown dicts from gap_analyzer.

    Returns:
        JSON array of daily study plans.
    """
    try:
        weak_topics = json.loads(weak_topics_json) if weak_topics_json else []
    except (json.JSONDecodeError, TypeError):
        weak_topics = []

    # Fall back to default weak topics if none provided
    if not weak_topics:
        pass_score = settings.sdle_pass_score
        weak_topics = [
            {"topic": t, "score": s, "gap": max(0, pass_score - s)}
            for t, s in _MOCK_TOPIC_SCORES.items()
            if s < pass_score
        ]
        weak_topics.sort(key=lambda x: x["gap"], reverse=True)

    plan: list[dict] = []
    today = datetime.now().date()

    for i, topic_info in enumerate(weak_topics):
        day = today + timedelta(days=i)
        gap = topic_info.get("gap", 0)
        topic = topic_info.get("topic", "Unknown")

        if gap >= 20:
            activities = [
                f"Review core concepts: {topic} (2 hours)",
                f"Practice 20 MCQs on {topic}",
                "Review incorrect answers with explanations",
            ]
        elif gap >= 10:
            activities = [
                f"Focused review: {topic} weak subtopics (1 hour)",
                f"Practice 10 MCQs on {topic}",
            ]
        else:
            activities = [
                f"Quick revision: {topic} key points (30 min)",
                f"Practice 5 high-yield MCQs on {topic}",
            ]

        plan.append({
            "day": i + 1,
            "date": day.isoformat(),
            "topic": topic,
            "score": topic_info.get("score", 0),
            "target": settings.sdle_pass_score,
            "activities": activities,
        })

    # Add spaced repetition review days
    for i, topic_info in enumerate(weak_topics[:3]):
        review_day = len(weak_topics) + (i * 2) + 1
        review_date = today + timedelta(days=review_day)
        plan.append({
            "day": review_day,
            "date": review_date.isoformat(),
            "topic": f"REVIEW: {topic_info.get('topic', 'Unknown')}",
            "score": topic_info.get("score", 0),
            "target": settings.sdle_pass_score,
            "activities": [
                f"Spaced repetition review of {topic_info.get('topic', 'Unknown')}",
                "Practice mixed MCQs from previously weak areas",
            ],
        })

    plan.sort(key=lambda x: x["day"])
    return json.dumps(plan)


@tool
def calendar_scheduler(study_plan_json: str, start_date: str = "") -> str:
    """Format a study plan into a calendar-friendly schedule.

    Args:
        study_plan_json: JSON array of study plan entries.
        start_date: Optional ISO date to start from. Defaults to today.

    Returns:
        JSON object with calendar-formatted schedule.
    """
    try:
        plan = json.loads(study_plan_json) if study_plan_json else []
    except (json.JSONDecodeError, TypeError):
        plan = []

    return json.dumps({
        "schedule": plan,
        "total_days": len(plan),
        "estimated_study_hours": sum(
            2 if "2 hours" in str(p.get("activities", [])) else 1
            for p in plan
        ),
        "format": "daily",
    })
