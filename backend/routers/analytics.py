"""Analytics router — Student performance dashboard data."""

from __future__ import annotations

import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends

from backend.models.schemas import AnalyticsResponse, ReadinessResponse, StudyPlanResponse
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(user: dict = Depends(get_current_user)):
    """Get performance analytics for the current student.

    Returns aggregated quiz scores, topic performance, and study streaks.
    """
    # Mock analytics data (in production, pulled from PostgreSQL)
    return AnalyticsResponse(
        student_id=user["id"],
        total_quizzes=15,
        average_score=68.5,
        topic_scores=[
            {"topic": "Operative Dentistry", "score": 78, "quizzes": 5},
            {"topic": "Oral Pathology", "score": 52, "quizzes": 3},
            {"topic": "Prosthodontics", "score": 65, "quizzes": 2},
            {"topic": "Endodontics", "score": 75, "quizzes": 2},
            {"topic": "Periodontics", "score": 70, "quizzes": 2},
            {"topic": "Pharmacology", "score": 45, "quizzes": 1},
        ],
        recent_sessions=[
            {"date": "2026-02-13", "topic": "Operative Dentistry", "score": 80, "questions": 10},
            {"date": "2026-02-12", "topic": "Oral Pathology", "score": 55, "questions": 10},
            {"date": "2026-02-11", "topic": "Periodontics", "score": 70, "questions": 5},
        ],
        study_streak_days=7,
    )


@router.get("/readiness", response_model=ReadinessResponse)
async def get_readiness(user: dict = Depends(get_current_user)):
    """Get exam readiness assessment.

    Uses the deep agent readiness tools to evaluate the student's
    preparedness for the SDLE exam.
    """
    from agents.tools.readiness_tools import gap_analyzer, readiness_calculator

    readiness_raw = readiness_calculator.invoke({"student_id": user["id"]})
    readiness = json.loads(readiness_raw)

    gaps_raw = gap_analyzer.invoke({"student_id": user["id"]})
    topic_breakdown = json.loads(gaps_raw)

    days_until_ready = max(
        sum(1 for t in topic_breakdown if t.get("status") != "strong"),
        7,
    )

    return ReadinessResponse(
        overall_readiness_pct=readiness["overall_readiness_pct"],
        pass_score=readiness["pass_score"],
        on_track=readiness["on_track"],
        topic_breakdown=topic_breakdown,
        days_until_ready=days_until_ready,
    )


@router.get("/study-plan", response_model=StudyPlanResponse)
async def get_study_plan(user: dict = Depends(get_current_user)):
    """Generate a personalised study plan.

    Uses the deep agent readiness tools to create a day-by-day schedule
    with spaced repetition.
    """
    from agents.tools.readiness_tools import gap_analyzer, study_plan_generator

    gaps_raw = gap_analyzer.invoke({"student_id": user["id"]})
    plan_raw = study_plan_generator.invoke({
        "student_id": user["id"],
        "weak_topics_json": gaps_raw,
    })
    plan = json.loads(plan_raw)

    return StudyPlanResponse(
        student_id=user["id"],
        study_plan=plan,
        generated_at=datetime.utcnow(),
    )
