"""Tests for backend services."""

from __future__ import annotations

import pytest
import os

# pydantic-settings is required by agents.config imported transitively by agent_service
pytest.importorskip("pydantic_settings", reason="pydantic-settings not installed")


class TestAuthService:
    def test_hash_and_verify_password(self):
        from backend.services.auth_service import hash_password, verify_password
        plain = "MySecurePassword123!"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed)

    def test_wrong_password_fails(self):
        from backend.services.auth_service import hash_password, verify_password
        hashed = hash_password("correct")
        assert not verify_password("wrong", hashed)

    def test_create_and_decode_access_token(self):
        from backend.services.auth_service import create_access_token, decode_token
        payload = {"sub": "user-123", "role": "student"}
        token = create_access_token(payload)
        assert isinstance(token, str)
        decoded = decode_token(token)
        assert decoded["sub"] == "user-123"
        assert decoded["type"] == "access"

    def test_create_and_decode_refresh_token(self):
        from backend.services.auth_service import create_refresh_token, decode_token
        payload = {"sub": "user-456"}
        token = create_refresh_token(payload)
        decoded = decode_token(token)
        assert decoded["sub"] == "user-456"
        assert decoded["type"] == "refresh"
        assert "jti" in decoded  # Unique token ID

    def test_access_token_has_exp(self):
        from backend.services.auth_service import create_access_token, decode_token
        token = create_access_token({"sub": "user-789"})
        decoded = decode_token(token)
        assert "exp" in decoded


try:
    import deepagents as _deepagents_module
    _has_deepagents = True
except ImportError:
    _has_deepagents = False

_skip_deepagents = pytest.mark.skipif(
    not _has_deepagents, reason="deepagents not installed"
)


@_skip_deepagents
class TestAgentServiceCitationExtraction:
    def test_extracts_citations(self):
        from backend.services.agent_service import _extract_citations
        text = (
            "Dental caries is caused by Streptococcus mutans "
            "[Source: Sturdevant's, Ch. 3, p. 67]. "
            "Composite resins require incremental placement "
            "[Source: Sturdevant's, Ch. 8, p. 205]."
        )
        citations = _extract_citations(text)
        assert len(citations) == 2
        assert citations[0]["verified"] is True
        assert "Sturdevant's" in citations[0]["source"]

    def test_no_citations_returns_empty(self):
        from backend.services.agent_service import _extract_citations
        text = "This is a response without any citations."
        citations = _extract_citations(text)
        assert citations == []

    def test_duplicate_citations_deduplicated(self):
        from backend.services.agent_service import _extract_citations
        text = (
            "First claim [Source: Book A, p. 1]. "
            "Second claim [Source: Book A, p. 1]. "
            "Third claim [Source: Book B, p. 2]."
        )
        citations = _extract_citations(text)
        sources = [c["source"] for c in citations]
        assert len(sources) == len(set(sources))
        assert len(citations) == 2
