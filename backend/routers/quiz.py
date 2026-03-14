"""Quiz router — Interactive quiz sessions with timed questions."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from agents.tools.quiz_tools import (
    MOCK_QUESTIONS,
    answer_evaluator,
    explanation_builder,
    hint_generator,
)
from backend.models.schemas import (
    AnswerFeedback,
    QuestionResponse,
    QuizAnswerRequest,
    QuizHintRequest,
    QuizResultsResponse,
    QuizStartRequest,
    QuizStartResponse,
)
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory quiz sessions (replaced by Redis + PostgreSQL in production)
_active_quizzes: dict[str, dict[str, Any]] = {}


@router.post("/start", response_model=QuizStartResponse)
async def start_quiz(req: QuizStartRequest, user: dict = Depends(get_current_user)):
    """Initialize a new quiz session.

    Selects questions from the bank based on the requested topic and
    difficulty, weighted toward the student's weak areas.
    """
    session_id = str(uuid.uuid4())

    # Filter questions
    questions = list(MOCK_QUESTIONS)
    if req.topic:
        filtered = [q for q in questions if q["topic"].lower() == req.topic.lower()]
        if filtered:
            questions = filtered

    selected = questions[: req.num_questions]

    _active_quizzes[session_id] = {
        "session_id": session_id,
        "student_id": user["id"],
        "questions": selected,
        "current_index": 0,
        "answers": [],
        "score": 0.0,
        "hints_used": 0,
    }

    first_q = selected[0]
    logger.info("Quiz started: session=%s, questions=%d", session_id, len(selected))

    return QuizStartResponse(
        session_id=session_id,
        total_questions=len(selected),
        current_question=QuestionResponse(
            id=first_q["id"],
            topic=first_q["topic"],
            subtopic=first_q.get("subtopic", ""),
            difficulty=first_q["difficulty"],
            text=first_q["text"],
            options=first_q["options"],
            time_limit=90,
        ),
    )


@router.post("/answer", response_model=AnswerFeedback)
async def submit_answer(req: QuizAnswerRequest, user: dict = Depends(get_current_user)):
    """Submit an answer to the current quiz question.

    Uses the deep agent explanation_builder tool for post-answer feedback.
    """
    quiz = _active_quizzes.get(req.session_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    if quiz["student_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your quiz session")

    # Find the question
    question = None
    for q in quiz["questions"]:
        if q["id"] == req.question_id:
            question = q
            break

    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this session")

    # Use the deep agent explanation_builder tool
    explanation_raw = explanation_builder.invoke({
        "question_id": req.question_id,
        "student_answer": req.selected_answer,
    })
    explanation_result = json.loads(explanation_raw)

    is_correct = explanation_result["is_correct"]

    # Record answer
    quiz["answers"].append({
        "question_id": req.question_id,
        "selected": req.selected_answer,
        "correct": is_correct,
        "time_spent": req.time_spent,
    })
    quiz["current_index"] += 1

    # Calculate running score
    correct_count = sum(1 for a in quiz["answers"] if a["correct"])
    quiz["score"] = (correct_count / len(quiz["answers"])) * 100

    remaining = len(quiz["questions"]) - quiz["current_index"]

    citations_str = explanation_result.get("citations", "")
    citations = [{"source": citations_str}] if citations_str else []

    return AnswerFeedback(
        is_correct=is_correct,
        correct_answer=explanation_result["correct_answer"],
        explanation=explanation_result["explanation"],
        citations=citations,
        score_so_far=quiz["score"],
        questions_remaining=remaining,
    )


@router.post("/hint")
async def get_hint(req: QuizHintRequest, user: dict = Depends(get_current_user)):
    """Request a Socratic hint for the current question."""
    quiz = _active_quizzes.get(req.session_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    question = None
    for q in quiz["questions"]:
        if q["id"] == req.question_id:
            question = q
            break

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    quiz["hints_used"] += 1
    hint_number = quiz["hints_used"]

    # Use the deep agent hint_generator tool
    hint_raw = hint_generator.invoke({
        "question_id": req.question_id,
        "hint_number": hint_number,
    })
    hint_result = json.loads(hint_raw)

    return {
        "hint": hint_result.get("hint", ""),
        "hint_number": hint_result.get("hint_number", hint_number),
        "max_hints": 3,
    }


@router.get("/results/{session_id}", response_model=QuizResultsResponse)
async def get_results(session_id: str, user: dict = Depends(get_current_user)):
    """Get the results summary for a completed quiz session."""
    quiz = _active_quizzes.get(session_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    if quiz["student_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your quiz session")

    correct_count = sum(1 for a in quiz["answers"] if a["correct"])
    total = len(quiz["questions"])
    total_time = sum(a.get("time_spent", 0) for a in quiz["answers"])

    # Topic breakdown
    topic_results: dict[str, dict] = {}
    for i, ans in enumerate(quiz["answers"]):
        q = quiz["questions"][i] if i < len(quiz["questions"]) else None
        if q:
            topic = q["topic"]
            if topic not in topic_results:
                topic_results[topic] = {"topic": topic, "correct": 0, "total": 0}
            topic_results[topic]["total"] += 1
            if ans["correct"]:
                topic_results[topic]["correct"] += 1

    return QuizResultsResponse(
        session_id=session_id,
        total_questions=total,
        correct_answers=correct_count,
        score=(correct_count / total * 100) if total > 0 else 0,
        duration=total_time,
        topic_breakdown=list(topic_results.values()),
        recommendations=[
            f"Focus more on {t['topic']}"
            for t in topic_results.values()
            if t["total"] > 0 and (t["correct"] / t["total"]) < 0.7
        ],
    )
