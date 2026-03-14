"""AdaptiveDifficultyMiddleware — Adjusts response depth to student level.

Uses the StudentProfileAgent's output to tailor the complexity and depth
of explanations to match the student's proficiency level.
"""

from __future__ import annotations

import logging

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from agents.config import settings

logger = logging.getLogger(__name__)

ADAPTATION_PROMPTS = {
    "beginner": (
        "Simplify the following explanation for a beginner dental student. "
        "Use simple language, define technical terms, and add analogies where helpful. "
        "Keep the citations intact.\n\nOriginal:\n{text}"
    ),
    "intermediate": (
        "The following explanation is for an intermediate dental student preparing "
        "for the SDLE. Keep it at a moderate depth — assume basic knowledge but "
        "explain complex mechanisms. Keep citations intact.\n\nOriginal:\n{text}"
    ),
    "advanced": (
        "The following is for an advanced dental student. You can use technical "
        "terminology freely and focus on nuances, exceptions, and clinical "
        "correlations. Keep citations intact.\n\nOriginal:\n{text}"
    ),
}


class AdaptiveDifficultyMiddleware:
    """Adjust response complexity based on student proficiency.

    For intermediate students, the response passes through unchanged.
    For beginners and advanced students, the LLM is used to adapt the
    language and depth.
    """

    async def process(self, response: str, profile: dict) -> str:
        """Adapt response difficulty to the student's level.

        Args:
            response: The agent's response text.
            profile: Student profile dict (needs ``proficiency_level``).

        Returns:
            Adapted response text.
        """
        level = profile.get("proficiency_level", "intermediate")

        # Intermediate is the default — no adaptation needed
        if level == "intermediate":
            return response

        # For beginner/advanced, use LLM to rewrite
        prompt_template = ADAPTATION_PROMPTS.get(level)
        if not prompt_template:
            return response

        logger.info("Adapting response for %s level", level)

        llm = ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            max_tokens=2048,
            temperature=0.3,
        )

        adapted = await llm.ainvoke([
            SystemMessage(content="You are an educational content adapter."),
            HumanMessage(content=prompt_template.format(text=response)),
        ])

        return adapted.content
