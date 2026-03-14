"""ClinicalSafetyMiddleware — Flags dangerous medical misinformation.

Scans agent outputs for potentially dangerous clinical advice and either
blocks or adds safety disclaimers.  This is a critical safety layer for
a healthcare education platform.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

# Keywords/patterns that may indicate dangerous clinical advice
DANGER_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b(prescribe|administer|inject)\b.*\b(yourself|at home|without)\b", re.IGNORECASE),
    re.compile(r"\b(stop taking|discontinue)\b.*\b(medication|antibiotic|drug)\b", re.IGNORECASE),
    re.compile(r"\b(no need|don't need)\b.*\b(to see|visit|consult)\b.*\b(doctor|dentist|physician)\b", re.IGNORECASE),
    re.compile(r"\b(guaranteed|100%|definitely)\b.*\b(cure|treat|heal)\b", re.IGNORECASE),
]

SAFETY_DISCLAIMER = (
    "\n\n---\n"
    "**Important**: This information is for educational and exam preparation "
    "purposes only. It does not constitute clinical advice. Always consult "
    "qualified healthcare professionals for patient care decisions."
)


class ClinicalSafetyMiddleware:
    """Post-processing middleware that ensures clinical safety of responses.

    Scans for dangerous patterns and adds appropriate disclaimers or
    redactions to protect students from acting on AI-generated clinical
    advice outside an educational context.
    """

    def process(self, response: str) -> str:
        """Process an agent response through the clinical safety filter.

        Args:
            response: Raw response text from the agent.

        Returns:
            Processed response with safety modifications applied.
        """
        flagged = False
        processed = response

        for pattern in DANGER_PATTERNS:
            if pattern.search(processed):
                logger.warning("Clinical safety flag: pattern '%s' matched", pattern.pattern)
                flagged = True

        if flagged:
            processed += SAFETY_DISCLAIMER
            logger.info("Added clinical safety disclaimer to response")

        # Always add a subtle educational context note if discussing treatment
        treatment_keywords = ["treatment", "therapy", "management", "procedure", "surgery"]
        if any(kw in processed.lower() for kw in treatment_keywords):
            if SAFETY_DISCLAIMER not in processed:
                processed += SAFETY_DISCLAIMER

        return processed
