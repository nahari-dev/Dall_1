"""ExplanationSkill — Post-answer deep dive with citations.

After a student answers a quiz question, provides a thorough explanation
referencing textbook sources and connecting the concept to the broader
exam context.
"""

from __future__ import annotations

import logging

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from agents.config import settings

logger = logging.getLogger(__name__)

EXPLANATION_SYSTEM_PROMPT = """\
You are a dental exam tutor providing a post-answer explanation for an SDLE
practice question.

Question: {question}
Student's answer: {student_answer}
Correct answer: {correct_answer}
Base explanation: {base_explanation}
Citations: {citations}

Instructions:
1. State whether the student was correct or incorrect.
2. Explain WHY the correct answer is right, using the base explanation.
3. Briefly explain why each wrong option is incorrect.
4. Cite every factual claim: [Source: Book, Ch. X, p. Y]
5. Connect to a "high-yield exam tip" if applicable.
6. If the student writes in Arabic, respond in Arabic.

Be thorough but concise.  Format clearly with bullet points where appropriate.
"""


class ExplanationSkill:
    """Generate comprehensive post-answer explanations with citations."""

    async def explain(
        self,
        question: dict,
        student_answer: str,
    ) -> dict:
        """Generate a detailed explanation for a quiz answer.

        Args:
            question: Full question dict including options, correct answer, explanation.
            student_answer: The option key the student selected (e.g. ``"B"``).

        Returns:
            Dict with ``is_correct``, ``explanation``, ``citations``,
            and ``exam_tip``.
        """
        correct = student_answer.upper() == question.get("correct_answer", "").upper()

        citations_text = "; ".join(
            f"{c.get('book', '')}, Ch. {c.get('chapter', '')}, p. {c.get('page', '')}"
            for c in question.get("citations", [])
        )

        llm = ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            max_tokens=1500,
            temperature=0.3,
        )

        options_text = "\n".join(f"{k}: {v}" for k, v in question.get("options", {}).items())
        full_question = f"{question.get('text', '')}\n{options_text}"

        response = await llm.ainvoke([
            SystemMessage(
                content=EXPLANATION_SYSTEM_PROMPT.format(
                    question=full_question,
                    student_answer=student_answer,
                    correct_answer=question.get("correct_answer", ""),
                    base_explanation=question.get("explanation", ""),
                    citations=citations_text,
                )
            ),
            HumanMessage(content="Please explain this question."),
        ])

        logger.info(
            "Explanation generated for q=%s, correct=%s",
            question.get("id"),
            correct,
        )

        return {
            "is_correct": correct,
            "explanation": response.content,
            "citations": question.get("citations", []),
            "student_answer": student_answer,
            "correct_answer": question.get("correct_answer", ""),
        }
