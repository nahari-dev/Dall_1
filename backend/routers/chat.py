"""Chat router — Main AI chat endpoint with SSE streaming."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sse_starlette.sse import EventSourceResponse

from backend.models.schemas import ChatRequest, ChatResponse
from backend.routers.auth import get_current_user
from backend.services.agent_service import process_chat, stream_chat
from backend.services.rate_limiter import check_rate_limit

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    """Process a chat message and return a complete response.

    This is the non-streaming variant.  For real-time streaming, use
    the ``/stream`` endpoint instead.
    """
    # Rate limiting
    allowed, remaining = await check_rate_limit(user["id"], user.get("tier", "free"))
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Daily query limit reached. Upgrade your plan for more queries.",
        )

    result = await process_chat(
        message=req.message,
        student_id=user["id"],
        session_id=req.session_id,
    )

    return ChatResponse(
        response=result["response"],
        citations=result["citations"],
        session_id=result["session_id"],
        intent=result["intent"],
    )


@router.post("/stream")
async def chat_stream(req: ChatRequest, user: dict = Depends(get_current_user)):
    """Stream a chat response via Server-Sent Events (SSE).

    Emits chunks of type: ``session``, ``text``, ``status``, ``citations``, ``done``, ``error``.
    """
    allowed, remaining = await check_rate_limit(user["id"], user.get("tier", "free"))
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Daily query limit reached. Upgrade your plan for more queries.",
        )

    return EventSourceResponse(
        stream_chat(
            message=req.message,
            student_id=user["id"],
            session_id=req.session_id,
        )
    )
