"""QuestionSelectionSkill — Weighted question selection for quizzes.

Picks questions from the bank with weighting toward the student's weak areas,
ensuring a balanced mix of difficulties and topics.
"""

from __future__ import annotations

import random
from typing import Any


class QuestionSelectionSkill:
    """Select quiz questions weighted by student weaknesses and topic distribution.

    The algorithm assigns higher probability to questions in the student's
    identified weak topics while still including some questions from strong
    areas to reinforce knowledge.
    """

    WEAK_TOPIC_WEIGHT = 3.0
    NORMAL_WEIGHT = 1.0

    def select(
        self,
        question_bank: list[dict[str, Any]],
        weak_topics: list[str],
        difficulty: str = "medium",
        count: int = 5,
    ) -> list[dict[str, Any]]:
        """Select ``count`` questions from the bank using weighted sampling.

        Args:
            question_bank: Full list of available questions.
            weak_topics: Topics the student needs to improve on.
            difficulty: Preferred difficulty level (``easy``, ``medium``, ``hard``).
            count: Number of questions to select.

        Returns:
            List of selected question dicts.
        """
        if not question_bank:
            return []

        # Assign weights
        weighted: list[tuple[dict, float]] = []
        for q in question_bank:
            weight = self.NORMAL_WEIGHT
            if q.get("topic") in weak_topics:
                weight = self.WEAK_TOPIC_WEIGHT
            if q.get("difficulty") == difficulty:
                weight *= 1.5
            weighted.append((q, weight))

        # Weighted random selection without replacement
        selected: list[dict] = []
        remaining = list(weighted)

        for _ in range(min(count, len(remaining))):
            total_weight = sum(w for _, w in remaining)
            if total_weight == 0:
                break

            r = random.uniform(0, total_weight)
            cumulative = 0.0
            for idx, (q, w) in enumerate(remaining):
                cumulative += w
                if cumulative >= r:
                    selected.append(q)
                    remaining.pop(idx)
                    break

        return selected
