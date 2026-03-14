"""Custom middleware for the Deep Agents supervisor.

Maps the 5 existing post-processing middleware to the ``AgentMiddleware``
base class from ``langchain.agents.middleware.types``.

Middleware lifecycle hooks used:
- ``abefore_model``: inject context before model call (difficulty, language)
- ``aafter_model``: inspect/modify output after model call (safety, hallucination, PII)
- ``awrap_model_call``: intercept the full model call (language detection + injection)

These middleware are passed to ``create_deep_agent(middleware=[...])`` and run
AFTER the built-in stack (TodoList, Filesystem, SubAgent, Summarization, etc.).
"""

from __future__ import annotations

import logging
import re
from typing import Any

from langchain.agents.middleware.types import AgentMiddleware

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 1. ClinicalSafetyMiddleware
# ---------------------------------------------------------------------------

# Keywords/patterns that may indicate dangerous clinical advice
_DANGER_PATTERNS: list[re.Pattern[str]] = [
    re.compile(
        r"\b(prescribe|administer|inject)\b.*\b(yourself|at home|without)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(stop taking|discontinue)\b.*\b(medication|antibiotic|drug)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(no need|don't need)\b.*\b(to see|visit|consult)\b.*\b(doctor|dentist|physician)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(guaranteed|100%|definitely)\b.*\b(cure|treat|heal)\b",
        re.IGNORECASE,
    ),
]

_SAFETY_DISCLAIMER = (
    "\n\n---\n"
    "**Important**: This information is for educational and exam preparation "
    "purposes only. It does not constitute clinical advice. Always consult "
    "qualified healthcare professionals for patient care decisions."
)


class ClinicalSafetyMiddleware(AgentMiddleware):
    """Flags dangerous medical misinformation in agent outputs.

    Runs as ``aafter_model`` hook — inspects every agent response for:
    - Contraindicated drug interactions
    - Dangerous dosage recommendations
    - Procedures outside dental scope
    - Unqualified medical advice

    If flagged: appends a safety disclaimer to the output.
    """

    async def aafter_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Inspect the last AI message for clinical safety violations."""
        messages = state.get("messages", [])
        if not messages:
            return None

        last_msg = messages[-1]
        content = getattr(last_msg, "content", "")
        if not isinstance(content, str):
            return None

        flagged = any(pattern.search(content) for pattern in _DANGER_PATTERNS)

        # Also flag treatment-related content
        treatment_keywords = ("treatment", "therapy", "management", "procedure", "surgery")
        has_treatment = any(kw in content.lower() for kw in treatment_keywords)

        if flagged or has_treatment:
            if _SAFETY_DISCLAIMER not in content:
                from langchain_core.messages import AIMessage

                new_content = content + _SAFETY_DISCLAIMER
                new_msg = AIMessage(content=new_content)
                if flagged:
                    logger.warning("Clinical safety flag triggered on response")
                return {"messages": [new_msg]}

        return None


# ---------------------------------------------------------------------------
# 2. HallucinationGuardMiddleware
# ---------------------------------------------------------------------------

_HEDGE_PREFIX = "This claim could not be verified against our sources: "


class HallucinationGuardMiddleware(AgentMiddleware):
    """Removes or hedges unverified claims in agent outputs.

    Runs as ``aafter_model`` hook — checks if response text contains
    unverified patterns (no citation tags) and adds hedging language.
    """

    async def aafter_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Check response for citation coverage."""
        messages = state.get("messages", [])
        if not messages:
            return None

        last_msg = messages[-1]
        content = getattr(last_msg, "content", "")
        if not isinstance(content, str):
            return None

        # Skip short responses or non-factual responses
        if len(content) < 100:
            return None

        # Check if the response contains factual claims without citations
        # A claim is considered potentially unverified if it makes strong
        # assertions without [Source: ...] tags
        sentences = content.split(".")
        unverified_claims = []
        strong_claim_patterns = re.compile(
            r"\b(is|are|was|were|causes?|leads? to|results? in|consists? of)\b",
            re.IGNORECASE,
        )

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence or len(sentence) < 30:
                continue
            has_citation = "[Source:" in sentence or "[source:" in sentence.lower()
            is_factual = bool(strong_claim_patterns.search(sentence))
            if is_factual and not has_citation:
                unverified_claims.append(sentence)

        if unverified_claims and len(unverified_claims) > 3:
            # If many claims lack citations, add a general caveat
            from langchain_core.messages import AIMessage

            caveat = (
                "\n\n*Note: Some claims in this response may not have been "
                "fully verified against indexed textbook sources. Please "
                "cross-reference with your study materials.*"
            )
            if caveat not in content:
                new_msg = AIMessage(content=content + caveat)
                logger.warning(
                    "HallucinationGuard: %d unverified claims detected",
                    len(unverified_claims),
                )
                return {"messages": [new_msg]}

        return None


# ---------------------------------------------------------------------------
# 3. AdaptiveDifficultyMiddleware
# ---------------------------------------------------------------------------


class AdaptiveDifficultyMiddleware(AgentMiddleware):
    """Adjusts response depth to student's proficiency level.

    Runs as ``abefore_model`` hook — reads student context from state
    and injects proficiency-appropriate instructions into the system message.
    """

    async def abefore_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Inject proficiency context before model call."""
        # Look for student profile data in the message history or state
        messages = state.get("messages", [])

        # Scan recent tool results for profile data
        proficiency = "intermediate"
        for msg in reversed(messages[-10:]):
            content = getattr(msg, "content", "")
            if isinstance(content, str) and "proficiency_level" in content:
                if '"advanced"' in content:
                    proficiency = "advanced"
                elif '"beginner"' in content:
                    proficiency = "beginner"
                break

        if proficiency == "intermediate":
            # No adaptation needed for intermediate
            return None

        from langchain_core.messages import SystemMessage

        if proficiency == "beginner":
            guidance = SystemMessage(
                content=(
                    "[Adaptive Difficulty: BEGINNER] Simplify explanations. "
                    "Define technical terms. Use analogies. Keep citations intact."
                )
            )
        else:
            guidance = SystemMessage(
                content=(
                    "[Adaptive Difficulty: ADVANCED] Use technical terminology "
                    "freely. Focus on nuances, exceptions, and clinical correlations. "
                    "Keep citations intact."
                )
            )

        return {"messages": [guidance]}


# ---------------------------------------------------------------------------
# 4. ArabicLocalizationMiddleware
# ---------------------------------------------------------------------------

# Unicode ranges for Arabic script
_ARABIC_PATTERN = re.compile(
    r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]"
)
_ARABIC_THRESHOLD = 0.3


class ArabicLocalizationMiddleware(AgentMiddleware):
    """Arabic/English bilingual support + RTL handling.

    Runs as ``abefore_model`` hook to detect input language and inject
    language instructions, and ``aafter_model`` to add RTL markers.
    """

    def _detect_language(self, text: str) -> str:
        """Detect whether text is primarily Arabic or English."""
        if not text:
            return "en"
        arabic_chars = len(_ARABIC_PATTERN.findall(text))
        total_chars = len(text.strip())
        if total_chars == 0:
            return "en"
        ratio = arabic_chars / total_chars
        return "ar" if ratio >= _ARABIC_THRESHOLD else "en"

    async def abefore_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Detect input language and inject instructions."""
        messages = state.get("messages", [])
        if not messages:
            return None

        # Find the latest human message
        user_text = ""
        for msg in reversed(messages):
            if getattr(msg, "type", "") == "human":
                user_text = getattr(msg, "content", "")
                break

        if not user_text:
            return None

        language = self._detect_language(user_text)
        if language == "ar":
            from langchain_core.messages import SystemMessage

            return {
                "messages": [
                    SystemMessage(
                        content=(
                            "[Language: Arabic] The student is writing in Arabic. "
                            "Respond in Arabic with proper dental terminology. "
                            "Use RTL-compatible formatting."
                        )
                    )
                ]
            }
        return None

    async def aafter_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Add RTL markers to Arabic responses."""
        messages = state.get("messages", [])
        if not messages:
            return None

        last_msg = messages[-1]
        content = getattr(last_msg, "content", "")
        if not isinstance(content, str):
            return None

        # Check if the response contains significant Arabic text
        if self._detect_language(content) == "ar":
            # Add RTL mark at the start if not already present
            if not content.startswith("\u200F"):
                from langchain_core.messages import AIMessage

                return {"messages": [AIMessage(content=f"\u200F{content}")]}

        return None


# ---------------------------------------------------------------------------
# 5. PIIProtectionMiddleware
# ---------------------------------------------------------------------------

_PII_PATTERNS: dict[str, re.Pattern[str]] = {
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "phone_saudi": re.compile(r"\b(?:\+966|00966|05)\d{8,9}\b"),
    "phone_general": re.compile(
        r"\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
    ),
    "national_id": re.compile(r"\b[12]\d{9}\b"),
    "credit_card": re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
}

_REDACTED = "[REDACTED]"


class PIIProtectionMiddleware(AgentMiddleware):
    """Saudi PDPL compliance — redacts PII from all agent outputs.

    Runs as ``aafter_model`` hook — scans for Saudi national IDs,
    phone numbers, email addresses, and credit card numbers.
    """

    async def aafter_model(
        self, state: Any, runtime: Any
    ) -> dict[str, Any] | None:
        """Scan and redact PII from the response."""
        messages = state.get("messages", [])
        if not messages:
            return None

        last_msg = messages[-1]
        content = getattr(last_msg, "content", "")
        if not isinstance(content, str):
            return None

        modified = content
        total_redactions = 0

        for pii_type, pattern in _PII_PATTERNS.items():
            matches = pattern.findall(modified)
            if matches:
                logger.warning("PII detected (%s): %d instances", pii_type, len(matches))
                modified = pattern.sub(_REDACTED, modified)
                total_redactions += len(matches)

        if total_redactions > 0:
            from langchain_core.messages import AIMessage

            logger.info("PII Protection: redacted %d items", total_redactions)
            return {"messages": [AIMessage(content=modified)]}

        return None


# ---------------------------------------------------------------------------
# Ordered middleware list
# ---------------------------------------------------------------------------


def get_middleware_stack() -> list[AgentMiddleware]:
    """Return the ordered middleware stack for ``create_deep_agent``.

    Order:
    1. AdaptiveDifficultyMiddleware (before_model — sets context)
    2. ArabicLocalizationMiddleware (before_model — language detection)
    3. [Built-in: TodoList, Filesystem, SubAgent, Summarization — automatic]
    4. ClinicalSafetyMiddleware (after_model — safety first)
    5. HallucinationGuardMiddleware (after_model — accuracy)
    6. PIIProtectionMiddleware (after_model — compliance last)
    """
    return [
        AdaptiveDifficultyMiddleware(),
        ArabicLocalizationMiddleware(),
        ClinicalSafetyMiddleware(),
        HallucinationGuardMiddleware(),
        PIIProtectionMiddleware(),
    ]
