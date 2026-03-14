"""Pydantic v2 schemas for request/response validation."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    """Student registration payload."""

    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """Login payload."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token pair."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class StudentResponse(BaseModel):
    """Public student profile."""

    id: str
    name: str
    email: str
    role: str
    tier: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Incoming chat message."""

    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Non-streaming chat response."""

    response: str
    citations: list[dict] = []
    session_id: str
    intent: str


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------

class QuizStartRequest(BaseModel):
    """Start a new quiz session."""

    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    num_questions: int = Field(default=5, ge=1, le=50)


class QuizAnswerRequest(BaseModel):
    """Submit an answer to a quiz question."""

    session_id: str
    question_id: str
    selected_answer: str = Field(..., max_length=5)
    time_spent: int = Field(default=0, ge=0)


class QuizHintRequest(BaseModel):
    """Request a hint for the current question."""

    session_id: str
    question_id: str


class QuestionResponse(BaseModel):
    """A single quiz question (no answer revealed)."""

    id: str
    topic: str
    subtopic: str
    difficulty: str
    text: str
    options: dict[str, str]
    time_limit: int


class QuizStartResponse(BaseModel):
    """Quiz session initialised."""

    session_id: str
    total_questions: int
    current_question: QuestionResponse


class AnswerFeedback(BaseModel):
    """Feedback after submitting an answer."""

    is_correct: bool
    correct_answer: str
    explanation: str
    citations: list[dict] = []
    score_so_far: float
    questions_remaining: int


class QuizResultsResponse(BaseModel):
    """Completed quiz summary."""

    session_id: str
    total_questions: int
    correct_answers: int
    score: float
    duration: int
    topic_breakdown: list[dict] = []
    recommendations: list[str] = []


# ---------------------------------------------------------------------------
# Readiness
# ---------------------------------------------------------------------------

class ReadinessResponse(BaseModel):
    """Exam readiness report."""

    overall_readiness_pct: float
    pass_score: int
    on_track: bool
    topic_breakdown: list[dict]
    days_until_ready: int


# ---------------------------------------------------------------------------
# Study Plan
# ---------------------------------------------------------------------------

class StudyPlanResponse(BaseModel):
    """Generated study plan."""

    student_id: str
    study_plan: list[dict]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

class AnalyticsResponse(BaseModel):
    """Student performance analytics."""

    student_id: str
    total_quizzes: int
    average_score: float
    topic_scores: list[dict]
    recent_sessions: list[dict] = []
    study_streak_days: int = 0


class AdminAnalyticsResponse(BaseModel):
    """Institutional analytics (admin view)."""

    total_students: int
    active_students_30d: int
    average_score: float
    top_topics: list[dict]
    tier_distribution: dict[str, int]

# ---------------------------------------------------------------------------
# Branding
# ---------------------------------------------------------------------------

class LogoResponse(BaseModel):
    """Logo upload/retrieval response."""

    logo_url: str
    uploaded_at: datetime
    file_size: int