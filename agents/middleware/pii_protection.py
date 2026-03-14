"""PII_ProtectionMiddleware — Saudi PDPL compliance.

Ensures that Personally Identifiable Information (PII) is never leaked
in agent responses.  Detects and redacts email addresses, phone numbers,
Saudi national IDs, and other sensitive patterns.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

# PII detection patterns
PII_PATTERNS: dict[str, re.Pattern] = {
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "phone_saudi": re.compile(r"\b(?:\+966|00966|05)\d{8,9}\b"),
    "phone_general": re.compile(r"\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "national_id": re.compile(r"\b[12]\d{9}\b"),  # Saudi National ID (10 digits, starts with 1 or 2)
    "credit_card": re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
    "ip_address": re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
}

REDACTION_PLACEHOLDER = "[REDACTED]"


class PIIProtectionMiddleware:
    """Detect and redact PII from agent responses for PDPL compliance.

    The Saudi Personal Data Protection Law (PDPL) requires strict handling
    of personal data.  This middleware ensures no PII leaks through in
    AI-generated responses.
    """

    def process(self, response: str) -> str:
        """Scan and redact PII from the response.

        Args:
            response: Raw agent response text.

        Returns:
            Response with all detected PII replaced by ``[REDACTED]``.
        """
        processed = response
        total_redactions = 0

        for pii_type, pattern in PII_PATTERNS.items():
            matches = pattern.findall(processed)
            if matches:
                logger.warning("PII detected (%s): %d instances", pii_type, len(matches))
                processed = pattern.sub(REDACTION_PLACEHOLDER, processed)
                total_redactions += len(matches)

        if total_redactions > 0:
            logger.info("PII Protection: redacted %d items", total_redactions)

        return processed
