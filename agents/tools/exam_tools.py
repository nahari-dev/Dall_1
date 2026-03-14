"""Exam pattern analysis tools for the exam-pattern-agent."""

from __future__ import annotations

import json
import logging

from langchain_core.tools import tool

logger = logging.getLogger(__name__)

# Mock SDLE exam distribution data
_EXAM_DISTRIBUTION = {
    "Operative Dentistry": {"pct": 18, "trend": "stable"},
    "Oral Pathology": {"pct": 15, "trend": "increasing"},
    "Prosthodontics": {"pct": 14, "trend": "stable"},
    "Orthodontics": {"pct": 10, "trend": "decreasing"},
    "Endodontics": {"pct": 10, "trend": "stable"},
    "Periodontics": {"pct": 9, "trend": "increasing"},
    "Oral Surgery": {"pct": 8, "trend": "stable"},
    "Pediatric Dentistry": {"pct": 7, "trend": "stable"},
    "Pharmacology": {"pct": 5, "trend": "increasing"},
    "Radiology": {"pct": 4, "trend": "stable"},
}


@tool
def exam_stats_query(topic: str = "") -> str:
    """Query SDLE exam statistics including topic frequency and difficulty trends.

    Args:
        topic: Optional specific topic to query. If empty, returns all topics.

    Returns:
        JSON object with exam distribution data, difficulty analysis, and pass rates.
    """
    if topic and topic in _EXAM_DISTRIBUTION:
        data = {topic: _EXAM_DISTRIBUTION[topic]}
    else:
        data = _EXAM_DISTRIBUTION

    return json.dumps({
        "topic_distribution": data,
        "difficulty_breakdown": {"easy": 40, "medium": 35, "hard": 25},
        "pass_rate": 65,
        "total_questions": 200,
        "exam_duration_hours": 4,
    })


@tool
def topic_frequency_analyzer(weak_topics: str = "[]") -> str:
    """Analyse topic frequency and identify high-yield areas based on student weaknesses.

    Args:
        weak_topics: JSON array of the student's weak topic names.

    Returns:
        JSON object with ranked topics and personalised recommendations.
    """
    try:
        weak = json.loads(weak_topics) if weak_topics else []
    except (json.JSONDecodeError, TypeError):
        weak = []

    ranked = sorted(
        _EXAM_DISTRIBUTION.items(),
        key=lambda x: x[1]["pct"],
        reverse=True,
    )

    high_yield = [
        {
            "topic": name,
            "frequency_rank": i + 1,
            "percentage": info["pct"],
            "recent_trend": info["trend"],
            "is_weak_area": name in weak,
        }
        for i, (name, info) in enumerate(ranked)
    ]

    recommendations = []
    for item in high_yield:
        if item["is_weak_area"] and item["percentage"] >= 10:
            recommendations.append(
                f"HIGH PRIORITY: {item['topic']} ({item['percentage']}% of exam) — "
                f"this is both high-yield and a weak area"
            )
        elif item["recent_trend"] == "increasing":
            recommendations.append(
                f"TRENDING UP: {item['topic']} — increasing in recent exams"
            )

    return json.dumps({
        "high_yield_topics": high_yield,
        "recommendations": recommendations,
    })


@tool
def difficulty_trend_tool(topic: str = "") -> str:
    """Analyse difficulty trends for SDLE exam topics.

    Args:
        topic: Optional specific topic to analyse.

    Returns:
        JSON object with difficulty trend analysis.
    """
    return json.dumps({
        "overall_difficulty": {
            "easy": "40% — foundational recall questions",
            "medium": "35% — application and clinical reasoning",
            "hard": "25% — complex case-based and integration questions",
        },
        "trend": "Increasing emphasis on clinical application over pure recall",
        "advice": (
            "Focus on understanding clinical reasoning rather than memorisation. "
            "Recent exams test application of knowledge to clinical scenarios."
        ),
    })
