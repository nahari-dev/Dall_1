"""HallucinationGuardMiddleware — Cross-checks against verified citations.

Ensures that the final response does not contain claims that were flagged
as unverified by the CitationAgent.  Unverified claims are either removed
or hedged with appropriate language.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


class HallucinationGuardMiddleware:
    """Filter out or hedge unverified claims in agent responses.

    Works in conjunction with the CitationAgent's verification output.
    """

    HEDGE_PHRASES = [
        "This claim could not be verified against our sources: ",
        "Note: The following has limited source support — ",
        "Based on general knowledge (unverified against textbooks): ",
    ]

    def process(self, response: str, citations: list[dict]) -> str:
        """Apply hallucination guards to the response.

        Args:
            response: The merged response text.
            citations: List of citation dicts from CitationAgent, each with
                       ``claim``, ``verified``, ``source``, ``confidence_score``.

        Returns:
            Processed response with unverified claims hedged or removed.
        """
        if not citations:
            return response

        unverified = [c for c in citations if not c.get("verified")]
        if not unverified:
            logger.info("HallucinationGuard: all claims verified")
            return response

        logger.warning(
            "HallucinationGuard: %d unverified claims detected",
            len(unverified),
        )

        processed = response

        for claim in unverified:
            claim_text = claim.get("claim", "")
            confidence = claim.get("confidence_score", 0.0)

            if confidence < 0.2:
                # Very low confidence — remove the claim
                if claim_text and claim_text in processed:
                    processed = processed.replace(claim_text, "")
                    logger.info("Removed low-confidence claim: %.60s", claim_text)
            elif confidence < 0.4:
                # Low confidence — hedge the claim
                if claim_text and claim_text in processed:
                    hedged = f"*{self.HEDGE_PHRASES[0]}{claim_text}*"
                    processed = processed.replace(claim_text, hedged)
                    logger.info("Hedged claim: %.60s", claim_text)

        return processed.strip()
