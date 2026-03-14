"""Supervisor Agent — Deep Agents ``create_deep_agent`` configuration.

Replaces the manual LangGraph ``StateGraph`` orchestrator with a single
``create_deep_agent`` call that provides built-in:
- TodoListMiddleware  -> task decomposition & planning
- FilesystemMiddleware -> file/context management with eviction
- SubAgentMiddleware  -> subagent delegation via ``task`` tool
- SummarizationMiddleware -> automatic context compression

Usage::

    from agents.supervisor import dall_supervisor
    result = await dall_supervisor.ainvoke(
        {"messages": [{"role": "user", "content": "What is dental caries?"}]},
        config={"configurable": {"thread_id": "student-123"}},
    )
"""

from __future__ import annotations

import logging

from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend

from agents.config import settings
from agents.middleware_stack import get_middleware_stack
from agents.prompts import DALL_SUPERVISOR_PROMPT
from agents.state import DallState
from agents.subagent_configs import get_subagents
from agents.tools.knowledge_tools import chromadb_search
from agents.tools.quiz_tools import question_selector

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Backend factory
# ---------------------------------------------------------------------------


def _make_backend(runtime):
    """Create a CompositeBackend routing paths to appropriate storage.

    - Default (``/``): ``StateBackend`` — ephemeral per-thread state
    - ``/memories/``: ``StoreBackend`` — cross-thread durable via PostgresStore
    - ``/student-profiles/``: ``StoreBackend`` — persistent student data

    Args:
        runtime: LangGraph ``ToolRuntime`` injected by the harness.

    Returns:
        Configured ``CompositeBackend`` instance.
    """
    return CompositeBackend(
        default=StateBackend(runtime),
        routes={
            "/memories/": StoreBackend(runtime),
            "/student-profiles/": StoreBackend(runtime),
        },
    )


# ---------------------------------------------------------------------------
# Checkpointer + Store (production: PostgresSaver + PostgresStore)
# ---------------------------------------------------------------------------

# In production, configure these with the actual connection string:
#   from langgraph.checkpoint.postgres import PostgresSaver
#   from langgraph.store.postgres import PostgresStore
#   checkpointer = PostgresSaver(conn_string=settings.database_url)
#   store = PostgresStore(conn_string=settings.database_url)
#
# For development without PostgreSQL, use in-memory defaults:
_checkpointer = True  # Use LangGraph's default MemorySaver
_store = None          # No cross-thread persistence in dev mode


# ---------------------------------------------------------------------------
# Build the Deep Agent supervisor
# ---------------------------------------------------------------------------

# Model identifier in provider:model format (e.g. "anthropic:claude-sonnet-4-20250514",
# "openai:gpt-4o").  The setting already includes the provider prefix.
_MODEL = settings.llm_model

# Domain tools available at the supervisor level (in addition to subagent tools)
_supervisor_tools = [chromadb_search, question_selector]

# Memory paths — persistent context written to /memories/ via StoreBackend
_memory_paths = [
    "/memories/sessions/",
    "/memories/quiz-history/",
]

dall_supervisor = create_deep_agent(
    model=_MODEL,
    system_prompt=DALL_SUPERVISOR_PROMPT,
    tools=_supervisor_tools,
    subagents=get_subagents(),
    middleware=get_middleware_stack(),
    memory=_memory_paths,
    context_schema=DallState,
    backend=_make_backend,
    checkpointer=_checkpointer,
    store=_store,
    name="dall-supervisor",
    debug=False,
)


def build_supervisor_graph():
    """Backward-compatible entry point.

    Returns the compiled Deep Agent graph, which implements the same
    ``ainvoke`` / ``astream_events`` interface as the old ``StateGraph``.

    Returns:
        The ``dall_supervisor`` CompiledStateGraph.
    """
    return dall_supervisor
