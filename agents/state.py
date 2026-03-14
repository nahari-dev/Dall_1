"""Shared state schema for the Deep Agents orchestration graph.

Every node in the LangGraph supervisor graph reads from and writes to this
TypedDict.  The ``add_messages`` reducer is used so that multiple subagents
can safely append to the message history in parallel.
"""

from __future__ import annotations

from typing import Annotated, Optional, TypedDict

from langgraph.graph import add_messages


class QuizState(TypedDict, total=False):
    """Nested state for an active quiz session."""

    session_id: str
    current_question_index: int
    questions: list[dict]
    answers: list[dict]
    score: float
    time_elapsed: int  # seconds
    hints_used: int
    completed: bool


class DallState(TypedDict, total=False):
    """Root state flowing through the supervisor graph.

    Attributes:
        messages: Conversation history (LangGraph ``add_messages`` reducer).
        student_id: Authenticated student identifier.
        intent: Classified intent of the latest student query.
        knowledge_results: RAG results from KnowledgeAgent.
        exam_patterns: Trend data from ExamPatternAgent.
        student_profile: Personalisation context from StudentProfileAgent.
        citations: Verified citation list from CitationAgent.
        final_response: Merged, citation-tagged answer returned to the student.
        quiz_state: Active quiz session data (optional).
        readiness: Exam readiness evaluation from ReadinessAgent.
        error: Error message if processing failed.
    """

    messages: Annotated[list, add_messages]
    student_id: str
    intent: str
    knowledge_results: list[dict]
    exam_patterns: dict
    student_profile: dict
    citations: list[dict]
    final_response: str
    quiz_state: Optional[QuizState]
    readiness: Optional[dict]
    error: Optional[str]
