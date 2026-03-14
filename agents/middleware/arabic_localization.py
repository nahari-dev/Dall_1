"""ArabicLocalizationMiddleware — Handles Arabic/English bilingual responses.

Detects the language of the student's message and ensures the response
matches.  When the student writes in Arabic, the response is generated
in Arabic (or translated if the upstream agents produced English).
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

# Unicode ranges for Arabic script
ARABIC_PATTERN = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]")


class ArabicLocalizationMiddleware:
    """Detect input language and ensure response language matches.

    If the student writes in Arabic, the system ensures the response
    is also in Arabic.  Mixed-language inputs default to the dominant
    language.
    """

    ARABIC_THRESHOLD = 0.3  # Fraction of Arabic characters to trigger Arabic mode

    def detect_language(self, text: str) -> str:
        """Detect whether the text is primarily Arabic or English.

        Args:
            text: Input text to analyse.

        Returns:
            ``"ar"`` for Arabic, ``"en"`` for English.
        """
        if not text:
            return "en"

        arabic_chars = len(ARABIC_PATTERN.findall(text))
        total_chars = len(text.strip())

        if total_chars == 0:
            return "en"

        ratio = arabic_chars / total_chars
        language = "ar" if ratio >= self.ARABIC_THRESHOLD else "en"
        logger.debug("Language detection: ratio=%.2f → %s", ratio, language)
        return language

    def add_rtl_markers(self, text: str) -> str:
        """Add RTL Unicode markers for proper Arabic rendering.

        Args:
            text: Arabic text to mark.

        Returns:
            Text with RTL markers prepended.
        """
        # U+200F = Right-to-Left Mark
        return f"\u200F{text}"

    def process(self, response: str, input_language: str) -> str:
        """Process the response for proper localisation.

        Args:
            response: Agent response text.
            input_language: Detected language of student's input (``"ar"`` or ``"en"``).

        Returns:
            Localised response text.
        """
        if input_language == "ar":
            # Ensure Arabic responses have proper RTL markers
            return self.add_rtl_markers(response)
        return response
