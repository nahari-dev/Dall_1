"""Deep Agents Core — ``deepagents``-based multi-agent orchestration engine for Dall Academy.

The supervisor is built with ``create_deep_agent`` and provides:
- 6 specialised subagents (knowledge, exam-pattern, citation, student-profile, quiz, readiness)
- 5 custom middleware (clinical safety, hallucination guard, adaptive difficulty, Arabic, PII)
- 6 progressive-disclosure skills (dental anatomy, SDLE format, pharmacology, etc.)
- CompositeBackend with StateBackend (ephemeral) + StoreBackend (persistent)
"""
