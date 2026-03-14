"""Tests for agent configuration and state schema."""

from __future__ import annotations

import pytest

try:
    import langgraph as _langgraph_module
    _has_langgraph = True
except ImportError:
    _has_langgraph = False

try:
    import deepagents as _deepagents_module
    _has_deepagents = True
except ImportError:
    _has_deepagents = False

_skip_langgraph = pytest.mark.skipif(not _has_langgraph, reason="langgraph not installed")
_skip_deepagents = pytest.mark.skipif(not _has_deepagents, reason="deepagents not installed")


class TestAgentConfig:
    def test_default_model(self):
        from agents.config import AgentConfig
        config = AgentConfig()
        assert config.llm_model == "anthropic:claude-sonnet-4-20250514"

    def test_model_format(self):
        """Model must be in 'provider:model' format."""
        from agents.config import AgentConfig
        config = AgentConfig()
        assert ":" in config.llm_model

    def test_default_pass_score(self):
        from agents.config import AgentConfig
        config = AgentConfig()
        assert config.sdle_pass_score == 70

    def test_rag_top_k_positive(self):
        from agents.config import AgentConfig
        config = AgentConfig()
        assert config.rag_top_k > 0

    def test_rag_relevance_threshold_range(self):
        from agents.config import AgentConfig
        config = AgentConfig()
        assert 0.0 <= config.rag_relevance_threshold <= 1.0

    def test_custom_model_via_env(self, monkeypatch):
        monkeypatch.setenv("LLM_MODEL", "openai:gpt-4o")
        from importlib import reload
        import agents.config as cfg_module
        reload(cfg_module)
        config = cfg_module.AgentConfig()
        assert config.llm_model == "openai:gpt-4o"


@_skip_langgraph
class TestDallState:
    def test_state_is_typed_dict(self):
        from agents.state import DallState
        import typing
        assert hasattr(DallState, "__annotations__")

    def test_required_fields_present(self):
        from agents.state import DallState
        annotations = DallState.__annotations__
        assert "messages" in annotations

    def test_optional_fields_present(self):
        from agents.state import DallState
        annotations = DallState.__annotations__
        for field in ("student_id", "intent", "quiz_state", "readiness", "error"):
            assert field in annotations, f"Missing field: {field}"


@_skip_langgraph
class TestQuizState:
    def test_quiz_state_fields(self):
        from agents.state import QuizState
        annotations = QuizState.__annotations__
        for field in ("session_id", "current_question_index", "questions", "score", "completed"):
            assert field in annotations, f"Missing QuizState field: {field}"


class TestSubagentConfigs:
    def test_returns_six_subagents(self):
        from agents.subagent_configs import get_subagents
        subagents = get_subagents()
        assert len(subagents) == 6

    def test_all_subagents_have_required_keys(self):
        from agents.subagent_configs import get_subagents
        subagents = get_subagents()
        for sa in subagents:
            assert "name" in sa, f"Subagent missing 'name': {sa}"
            assert "description" in sa, f"Subagent missing 'description': {sa}"
            assert "system_prompt" in sa, f"Subagent missing 'system_prompt': {sa}"

    def test_subagent_names_are_unique(self):
        from agents.subagent_configs import get_subagents
        subagents = get_subagents()
        names = [sa["name"] for sa in subagents]
        assert len(names) == len(set(names)), "Duplicate subagent names found"

    def test_expected_subagents_present(self):
        from agents.subagent_configs import get_subagents
        subagents = get_subagents()
        names = {sa["name"] for sa in subagents}
        expected = {
            "knowledge-agent",
            "exam-pattern-agent",
            "citation-agent",
            "student-profile-agent",
            "quiz-agent",
            "readiness-agent",
        }
        assert names == expected

    def test_subagents_have_tools_or_skills(self):
        from agents.subagent_configs import get_subagents
        subagents = get_subagents()
        # At least half of the subagents should have tools
        subagents_with_tools = [sa for sa in subagents if sa.get("tools")]
        assert len(subagents_with_tools) >= 3


@_skip_deepagents
class TestMiddlewareStack:
    def test_returns_five_middleware(self):
        from agents.middleware_stack import get_middleware_stack
        stack = get_middleware_stack()
        assert len(stack) == 5

    def test_all_are_agent_middleware(self):
        from agents.middleware_stack import get_middleware_stack
        from langchain.agents.middleware.types import AgentMiddleware
        stack = get_middleware_stack()
        for m in stack:
            assert isinstance(m, AgentMiddleware), f"Not an AgentMiddleware: {type(m)}"

    def test_order_is_correct(self):
        from agents.middleware_stack import (
            AdaptiveDifficultyMiddleware,
            ArabicLocalizationMiddleware,
            ClinicalSafetyMiddleware,
            HallucinationGuardMiddleware,
            PIIProtectionMiddleware,
            get_middleware_stack,
        )
        stack = get_middleware_stack()
        assert isinstance(stack[0], AdaptiveDifficultyMiddleware)
        assert isinstance(stack[1], ArabicLocalizationMiddleware)
        assert isinstance(stack[2], ClinicalSafetyMiddleware)
        assert isinstance(stack[3], HallucinationGuardMiddleware)
        assert isinstance(stack[4], PIIProtectionMiddleware)
