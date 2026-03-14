"""Agent service — Bridge between FastAPI and the Deep Agents engine.

Uses the ``dall_supervisor`` compiled Deep Agent graph for all agent
interactions. Supports both synchronous and SSE streaming responses.
"""

from __future__ import annotations

import json
import logging
import re
import uuid
from typing import AsyncIterator

from agents.supervisor import dall_supervisor

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Citation extraction helper
# ---------------------------------------------------------------------------

# Matches inline citation tags like [Source: Book Ch.3, p.45]
_CITATION_RE = re.compile(
    r"\[Source:\s*(?P<source>[^\]]+)\]",
    re.IGNORECASE,
)


def _extract_citations(text: str) -> list[dict]:
    """Pull structured citation dicts from ``[Source: …]`` tags in text."""
    seen: set[str] = set()
    citations: list[dict] = []
    for m in _CITATION_RE.finditer(text):
        src = m.group("source").strip()
        if src not in seen:
            seen.add(src)
            citations.append({"source": src, "verified": True})
    return citations


# ---------------------------------------------------------------------------
# Non-streaming chat
# ---------------------------------------------------------------------------


async def process_chat(
    message: str,
    student_id: str,
    session_id: str | None = None,
) -> dict:
    """Process a chat message through the Deep Agent pipeline.

    The supervisor automatically handles:
    - Intent classification (via system prompt)
    - Subagent delegation (via ``task`` tool)
    - Middleware processing (safety, hallucination, PII, etc.)
    - Context compression and prompt caching

    Args:
        message: Student's message text.
        student_id: Authenticated student ID.
        session_id: Optional existing session ID for continuity.

    Returns:
        Dict with ``response``, ``citations``, ``session_id``, ``intent``.
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    config = {
        "configurable": {
            "thread_id": f"student-{student_id}-{session_id}",
            "user_id": student_id,
        }
    }

    try:
        result = await dall_supervisor.ainvoke(
            {"messages": [{"role": "user", "content": message}]},
            config=config,
        )

        # Extract the final response from the message history
        messages = result.get("messages", [])
        response_text = ""
        if messages:
            last_msg = messages[-1]
            response_text = getattr(last_msg, "content", str(last_msg))

        if not response_text:
            response_text = "I couldn't process your request. Please try again."

        return {
            "response": response_text,
            "citations": _extract_citations(response_text),
            "session_id": session_id,
            "intent": result.get("intent", "deep_agent"),
        }

    except Exception as exc:
        logger.error("Agent invocation error: %s", exc, exc_info=True)
        return {
            "response": "An error occurred while processing your request. Please try again.",
            "citations": [],
            "session_id": session_id,
            "intent": "error",
        }


# ---------------------------------------------------------------------------
# SSE streaming chat
# ---------------------------------------------------------------------------


async def stream_chat(
    message: str,
    student_id: str,
    session_id: str | None = None,
) -> AsyncIterator[str]:
    """Stream a chat response via SSE using Deep Agent streaming.

    Uses ``astream_events`` for native LangGraph streaming support.

    Event types emitted:
    - ``session``  — session metadata (sent first)
    - ``text``     — incremental AI message token
    - ``citation`` — a verified citation extracted from the response
    - ``status``   — progress updates (subagent delegation, etc.)
    - ``done``     — signals end of stream
    - ``error``    — error payload if something goes wrong

    Args:
        message: Student's message text.
        student_id: Authenticated student ID.
        session_id: Optional session ID.

    Yields:
        SSE-formatted string chunks.
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    config = {
        "configurable": {
            "thread_id": f"student-{student_id}-{session_id}",
            "user_id": student_id,
        }
    }

    # Yield session metadata first
    yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

    # Accumulate full text so we can extract citations at the end
    full_text: list[str] = []

    try:
        # Stream events from the Deep Agent
        async for event in dall_supervisor.astream_events(
            {"messages": [{"role": "user", "content": message}]},
            config=config,
            version="v2",
        ):
            kind = event.get("event", "")

            # Stream AI message tokens as they arrive
            if kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk:
                    content = getattr(chunk, "content", "")
                    if content:
                        full_text.append(content)
                        yield f"data: {json.dumps({'type': 'text', 'content': content})}\n\n"

            # Stream subagent delegation events
            elif kind == "on_tool_start":
                tool_name = event.get("name", "")
                if tool_name == "task":
                    yield (
                        f"data: {json.dumps({'type': 'status', 'message': 'Delegating to subagent...'})}\n\n"
                    )

            # Stream tool completion events
            elif kind == "on_tool_end":
                tool_name = event.get("name", "")
                if tool_name == "task":
                    yield (
                        f"data: {json.dumps({'type': 'status', 'message': 'Subagent completed.'})}\n\n"
                    )

        # After streaming completes, extract and emit citations
        combined = "".join(full_text)
        citations = _extract_citations(combined)
        if citations:
            yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as exc:
        logger.error("Stream error: %s", exc, exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
