"""Subagent dictionary configurations for the Deep Agents supervisor.

Each subagent is a ``SubAgent`` TypedDict with:
- ``name``: unique identifier used by the ``task`` tool
- ``description``: action-oriented description for the supervisor's routing
- ``system_prompt``: instructions for the subagent
- ``tools``: domain-specific tools (optional, inherits from supervisor if omitted)
- ``model``: model override (optional)
- ``skills``: paths to SKILL.md files for progressive-disclosure knowledge

These replace the manual subagent functions in ``agents/subagents/*.py``.
"""

from __future__ import annotations

from agents.prompts import (
    CITATION_VERIFICATION_PROMPT,
    EXAM_PATTERN_PROMPT,
    KNOWLEDGE_AGENT_PROMPT,
    QUIZ_AGENT_PROMPT,
    READINESS_AGENT_PROMPT,
    STUDENT_PROFILE_PROMPT,
)
from agents.tools.exam_tools import (
    difficulty_trend_tool,
    exam_stats_query,
    topic_frequency_analyzer,
)
from agents.tools.knowledge_tools import (
    chromadb_search,
    citation_formatter,
    source_index_search,
)
from agents.tools.profile_tools import (
    learning_style_detector,
    profile_reader,
    proficiency_updater,
)
from agents.tools.quiz_tools import (
    answer_evaluator,
    explanation_builder,
    hint_generator,
    question_selector,
)
from agents.tools.readiness_tools import (
    calendar_scheduler,
    gap_analyzer,
    readiness_calculator,
    study_plan_generator,
)
from agents.config import settings

# Subagents inherit the top-level model setting so switching providers is a
# single env-var change (LLM_MODEL).  Override per-subagent by replacing the
# value in individual dicts below.
_MODEL = settings.llm_model


def get_subagents() -> list[dict]:
    """Return the list of 6 subagent configurations.

    Returns:
        List of SubAgent-compatible dicts.
    """
    return [
        # 1. KnowledgeAgent — RAG pipeline over dental textbooks
        {
            "name": "knowledge-agent",
            "description": (
                "RAG pipeline over dental textbooks (ChromaDB + Claude) with "
                "mandatory citations. Use when the student asks factual dental/"
                "medical questions, needs textbook references, or asks "
                "'what/why/how' about dental topics."
            ),
            "system_prompt": KNOWLEDGE_AGENT_PROMPT,
            "tools": [chromadb_search, citation_formatter],
            "model": _MODEL,
            "skills": [
                "/skills/dental-anatomy/",
                "/skills/pharmacology-safety/",
                "/skills/arabic-dental-terms/",
            ],
        },
        # 2. ExamPatternAgent — SDLE trend analysis
        {
            "name": "exam-pattern-agent",
            "description": (
                "SDLE exam trend analysis — topic frequency, difficulty trends, "
                "high-yield areas. Use when the student asks about exam patterns, "
                "what topics to focus on, or historical exam analysis."
            ),
            "system_prompt": EXAM_PATTERN_PROMPT,
            "tools": [exam_stats_query, topic_frequency_analyzer, difficulty_trend_tool],
            "model": _MODEL,
            "skills": [
                "/skills/sdle-exam-format/",
            ],
        },
        # 3. CitationAgent — Verification layer
        {
            "name": "citation-agent",
            "description": (
                "Verification layer that cross-checks claims against indexed "
                "sources. Use AFTER knowledge-agent produces an answer to verify "
                "accuracy. Also use when student questions the validity of "
                "information."
            ),
            "system_prompt": CITATION_VERIFICATION_PROMPT,
            "tools": [source_index_search],
            "model": _MODEL,
        },
        # 4. StudentProfileAgent — Adaptive personalisation
        {
            "name": "student-profile-agent",
            "description": (
                "Adaptive personalisation engine — tracks proficiency level, "
                "weak topics, learning style. Use to retrieve or update student "
                "context before generating personalised responses."
            ),
            "system_prompt": STUDENT_PROFILE_PROMPT,
            "tools": [profile_reader, proficiency_updater, learning_style_detector],
            "model": _MODEL,
        },
        # 5. QuizAgent — Interactive assessment
        {
            "name": "quiz-agent",
            "description": (
                "Interactive quiz assessment with Socratic hints and detailed "
                "explanations. Use when the student wants to practice, take a "
                "quiz, or requests practice questions."
            ),
            "system_prompt": QUIZ_AGENT_PROMPT,
            "tools": [question_selector, hint_generator, explanation_builder, answer_evaluator],
            "model": _MODEL,
            "skills": [
                "/skills/socratic-tutoring/",
                "/skills/sdle-exam-format/",
            ],
        },
        # 6. ReadinessAgent — BDI-style exam readiness
        {
            "name": "readiness-agent",
            "description": (
                "BDI-style exam readiness evaluator with study plan generation. "
                "Use when the student asks 'am I ready?', wants a study plan, or "
                "requests a readiness assessment."
            ),
            "system_prompt": READINESS_AGENT_PROMPT,
            "tools": [readiness_calculator, study_plan_generator, gap_analyzer, calendar_scheduler],
            "model": _MODEL,
            "skills": [
                "/skills/study-plan-templates/",
                "/skills/sdle-exam-format/",
            ],
        },
    ]
