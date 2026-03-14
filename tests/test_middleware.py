"""Tests for custom AgentMiddleware implementations."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock

# Skip entire module when deepagents/langchain middleware stack is not available
pytest.importorskip("langchain_core", reason="langchain-core not installed")
pytest.importorskip("deepagents", reason="deepagents not installed (provides langchain.agents.middleware)")

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_state(messages: list) -> dict:
    return {"messages": messages}


# ---------------------------------------------------------------------------
# ClinicalSafetyMiddleware
# ---------------------------------------------------------------------------


class TestClinicalSafetyMiddleware:
    @pytest.fixture
    def middleware(self):
        from agents.middleware_stack import ClinicalSafetyMiddleware
        return ClinicalSafetyMiddleware()

    @pytest.mark.asyncio
    async def test_safe_response_unchanged(self, middleware):
        """Non-clinical responses are not modified."""
        msg = AIMessage(content="The tooth has three cusps and two roots.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_dangerous_advice_gets_disclaimer(self, middleware):
        """Clinical treatment content gets safety disclaimer appended."""
        content = (
            "The treatment plan involves surgical extraction of tooth #18. "
            "Management should include antibiotics and analgesics post-operatively."
        )
        msg = AIMessage(content=content)
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert "exam preparation purposes only" in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_disclaimer_not_duplicated(self, middleware):
        """Safety disclaimer is not added twice."""
        content = (
            "Management of pericoronitis treatment requires irrigation. "
            "\n\n---\n**Important**: This information is for educational and exam preparation "
            "purposes only. It does not constitute clinical advice. Always consult "
            "qualified healthcare professionals for patient care decisions."
        )
        msg = AIMessage(content=content)
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None  # Already has disclaimer, no modification

    @pytest.mark.asyncio
    async def test_empty_messages_returns_none(self, middleware):
        result = await middleware.aafter_model({"messages": []}, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_prescribe_without_doctor_pattern(self, middleware):
        """Matches 'prescribe yourself' pattern."""
        msg = AIMessage(content="You can prescribe amoxicillin yourself without a doctor.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert "exam preparation" in result["messages"][0].content


# ---------------------------------------------------------------------------
# HallucinationGuardMiddleware
# ---------------------------------------------------------------------------


class TestHallucinationGuardMiddleware:
    @pytest.fixture
    def middleware(self):
        from agents.middleware_stack import HallucinationGuardMiddleware
        return HallucinationGuardMiddleware()

    @pytest.mark.asyncio
    async def test_short_response_unchanged(self, middleware):
        """Short responses (< 100 chars) are not checked."""
        msg = AIMessage(content="Yes, that is correct.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_well_cited_response_unchanged(self, middleware):
        """Response with citations is not flagged."""
        content = (
            "Dental caries is caused by Streptococcus mutans [Source: Sturdevant's, Ch. 3, p. 67]. "
            "The process involves demineralization [Source: Sturdevant's, Ch. 3, p. 68]. "
            "Treatment includes remineralization [Source: Sturdevant's, Ch. 3, p. 70]. "
            "Prevention involves fluoride therapy [Source: Sturdevant's, Ch. 3, p. 71]."
        )
        msg = AIMessage(content=content)
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_messages_returns_none(self, middleware):
        result = await middleware.aafter_model({"messages": []}, None)
        assert result is None


# ---------------------------------------------------------------------------
# AdaptiveDifficultyMiddleware
# ---------------------------------------------------------------------------


class TestAdaptiveDifficultyMiddleware:
    @pytest.fixture
    def middleware(self):
        from agents.middleware_stack import AdaptiveDifficultyMiddleware
        return AdaptiveDifficultyMiddleware()

    @pytest.mark.asyncio
    async def test_intermediate_no_injection(self, middleware):
        """Intermediate proficiency needs no guidance injection."""
        msg = HumanMessage(content="Explain dental caries.")
        state = _make_state([msg])
        result = await middleware.abefore_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_beginner_injection(self, middleware):
        """Beginner proficiency injects simplification guidance."""
        tool_result = MagicMock()
        tool_result.content = '{"proficiency_level": "beginner"}'
        msg = HumanMessage(content="Explain dental caries.")
        state = _make_state([tool_result, msg])
        result = await middleware.abefore_model(state, None)
        assert result is not None
        assert "BEGINNER" in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_advanced_injection(self, middleware):
        """Advanced proficiency injects technical guidance."""
        tool_result = MagicMock()
        tool_result.content = '{"proficiency_level": "advanced"}'
        msg = HumanMessage(content="Complex question.")
        state = _make_state([tool_result, msg])
        result = await middleware.abefore_model(state, None)
        assert result is not None
        assert "ADVANCED" in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_empty_messages_returns_none(self, middleware):
        result = await middleware.abefore_model({"messages": []}, None)
        assert result is None


# ---------------------------------------------------------------------------
# ArabicLocalizationMiddleware
# ---------------------------------------------------------------------------


class TestArabicLocalizationMiddleware:
    @pytest.fixture
    def middleware(self):
        from agents.middleware_stack import ArabicLocalizationMiddleware
        return ArabicLocalizationMiddleware()

    def test_detect_arabic(self, middleware):
        assert middleware._detect_language("ما هو تسوس الأسنان؟") == "ar"

    def test_detect_english(self, middleware):
        assert middleware._detect_language("What is dental caries?") == "en"

    def test_detect_mixed_below_threshold(self, middleware):
        """Mostly English with a few Arabic chars = English."""
        assert middleware._detect_language("This is a test مرحبا") == "en"

    @pytest.mark.asyncio
    async def test_arabic_input_injects_language_guidance(self, middleware):
        msg = HumanMessage(content="ما هو تسوس الأسنان؟")
        state = _make_state([msg])
        result = await middleware.abefore_model(state, None)
        assert result is not None
        assert "Arabic" in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_english_input_no_injection(self, middleware):
        msg = HumanMessage(content="What is dental caries?")
        state = _make_state([msg])
        result = await middleware.abefore_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_arabic_response_gets_rtl_mark(self, middleware):
        msg = AIMessage(content="تسوس الأسنان هو مرض ")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert result["messages"][0].content.startswith("\u200F")

    @pytest.mark.asyncio
    async def test_english_response_no_rtl_mark(self, middleware):
        msg = AIMessage(content="Dental caries is caused by bacteria.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None


# ---------------------------------------------------------------------------
# PIIProtectionMiddleware
# ---------------------------------------------------------------------------


class TestPIIProtectionMiddleware:
    @pytest.fixture
    def middleware(self):
        from agents.middleware_stack import PIIProtectionMiddleware
        return PIIProtectionMiddleware()

    @pytest.mark.asyncio
    async def test_email_redacted(self, middleware):
        msg = AIMessage(content="Contact student at john.doe@example.com for info.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert "john.doe@example.com" not in result["messages"][0].content
        assert "[REDACTED]" in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_saudi_phone_redacted(self, middleware):
        msg = AIMessage(content="Call us at 0501234567 for support.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert "0501234567" not in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_national_id_redacted(self, middleware):
        msg = AIMessage(content="Student national ID: 1234567890.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is not None
        assert "1234567890" not in result["messages"][0].content

    @pytest.mark.asyncio
    async def test_clean_text_unchanged(self, middleware):
        msg = AIMessage(content="Dental anatomy includes enamel, dentin, and pulp.")
        state = _make_state([msg])
        result = await middleware.aafter_model(state, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_messages_returns_none(self, middleware):
        result = await middleware.aafter_model({"messages": []}, None)
        assert result is None
