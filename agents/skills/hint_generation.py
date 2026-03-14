"""HintSkill — Socratic Graph-of-Thought hint generation.

Instead of revealing the answer, generates a sequence of guiding sub-questions
that lead the student toward the correct reasoning path.
"""

from __future__ import annotations

import logging

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from agents.config import settings

logger = logging.getLogger(__name__)

SOCRATIC_SYSTEM_PROMPT = """\
You are a Socratic dental tutor for the SDLE exam.  A student is stuck on a
multiple-choice question and needs a hint.

Question: {question}
Options: {options}
Correct answer: {correct_answer}
Hint number: {hint_number} of 3

Rules:
1. Do NOT reveal the answer directly.
2. Ask a guiding sub-question that activates the student's existing knowledge.
3. Each successive hint should be more specific:
   - Hint 1: Broad conceptual nudge
   - Hint 2: Narrow the possibilities (eliminate 1-2 options)
   - Hint 3: Strong directional hint (almost gives it away)
4. Use encouraging, supportive language.
5. If the student writes in Arabic, respond in Arabic.

Respond with ONLY the hint text.
"""


class HintGenerationSkill:
    """Generate Socratic hints that guide without revealing the answer."""

    MAX_HINTS = 3

    async def generate_hint(
        self,
        question: dict,
        hint_number: int,
    ) -> str:
        """Generate a progressive Socratic hint.

        Args:
            question: The question dict with ``text``, ``options``, ``correct_answer``.
            hint_number: Which hint (1-3) to generate.

        Returns:
            Hint text string.
        """
        if hint_number > self.MAX_HINTS:
            return "You've used all available hints. Try your best — trust your knowledge!"

        options_text = "\n".join(f"{k}: {v}" for k, v in question.get("options", {}).items())

        llm = ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            max_tokens=500,
            temperature=0.4,
        )

        response = await llm.ainvoke([
            SystemMessage(
                content=SOCRATIC_SYSTEM_PROMPT.format(
                    question=question.get("text", ""),
                    options=options_text,
                    correct_answer=question.get("correct_answer", ""),
                    hint_number=hint_number,
                )
            ),
            HumanMessage(content="I need a hint for this question."),
        ])

        logger.info("Generated hint %d for question %s", hint_number, question.get("id"))
        return response.content
