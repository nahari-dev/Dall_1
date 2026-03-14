# Deep Agents Migration Discovery Report

**Date**: 2026-02-21
**Package**: `deepagents==0.4.3`
**LangChain Core**: `langchain-core==1.2.14`
**LangGraph**: `langgraph==1.0.9`

---

## Step 0 — Boundary Table

| Path | Status | Reason |
|------|--------|--------|
| `frontend/` | UNTOUCHABLE | Next.js 14 — no changes |
| `backend/routers/` | UNTOUCHABLE | FastAPI routers |
| `backend/models/` | UNTOUCHABLE | Pydantic + SQLAlchemy |
| `backend/middleware/` | UNTOUCHABLE | FastAPI middleware |
| `backend/main.py` | UNTOUCHABLE | FastAPI entrypoint |
| `backend/services/auth_service.py` | UNTOUCHABLE | Auth logic |
| `backend/services/rate_limiter.py` | UNTOUCHABLE | Rate limiting |
| `docker-compose.yml` | UNTOUCHABLE | Infrastructure |
| `data/` | UNTOUCHABLE | Seed data |
| `agents/` | **IN SCOPE** | Full migration |
| `backend/services/agent_service.py` | **IN SCOPE** | Bridge to agents |
| `pyproject.toml` | **IN SCOPE** | Add deepagents dependency |

---

## Step 1 — Python Introspection Results

### 1.1 `create_deep_agent` Signature (VERIFIED)
```python
create_deep_agent(
    model: str | BaseChatModel | None = None,  # default: "claude-sonnet-4-5-20250929"
    tools: Sequence[BaseTool | Callable | dict] | None = None,
    *,
    system_prompt: str | SystemMessage | None = None,
    middleware: Sequence[AgentMiddleware] = (),  # appended AFTER built-in stack
    subagents: list[SubAgent | CompiledSubAgent] | None = None,
    skills: list[str] | None = None,  # paths relative to backend root
    memory: list[str] | None = None,  # AGENTS.md file paths
    response_format=None,
    context_schema: type | None = None,
    checkpointer: None | bool | BaseCheckpointSaver = None,
    store: BaseStore | None = None,
    backend: BackendProtocol | Callable[[ToolRuntime], BackendProtocol] | None = None,
    interrupt_on: dict[str, bool | InterruptOnConfig] | None = None,
    debug: bool = False,
    name: str | None = None,
    cache: BaseCache | None = None,
) -> CompiledStateGraph
```

Built-in middleware stack (auto-applied):
1. `TodoListMiddleware`
2. `FilesystemMiddleware`
3. `SubAgentMiddleware`
4. `SummarizationMiddleware`
5. `AnthropicPromptCachingMiddleware`
6. `PatchToolCallsMiddleware`

### 1.2 `SubAgent` TypedDict (VERIFIED)
```python
# Required keys:
SubAgent.__required_keys__ = frozenset({'description', 'name', 'system_prompt'})
# Optional keys:
SubAgent.__optional_keys__ = frozenset({'interrupt_on', 'middleware', 'model', 'skills', 'tools'})
```

**CRITICAL**: Uses `system_prompt`, NOT `prompt`.

### 1.3 `CompiledSubAgent` TypedDict (VERIFIED)
```python
CompiledSubAgent.__required_keys__ = frozenset({'description', 'name', 'runnable'})
```

### 1.4 `AgentMiddleware` Base Class (VERIFIED)
```python
from langchain.agents.middleware.types import AgentMiddleware

# Available hooks:
- before_agent(state, runtime) -> dict | None
- after_agent(state, runtime) -> dict | None
- before_model(state, runtime) -> dict | None
- after_model(state, runtime) -> dict | None
- awrap_model_call(request, handler) -> ModelResponse
- awrap_tool_call(request, handler) -> ToolMessage | Command
# Plus async versions: abefore_agent, aafter_agent, abefore_model, aafter_model
```

**CRITICAL**: No `modify_model_request` method exists. Use `awrap_model_call` instead.

### 1.5 Backend Classes (VERIFIED)

**StateBackend**: `StateBackend(runtime: ToolRuntime)` — ephemeral, per-thread
**StoreBackend**: `StoreBackend(runtime: ToolRuntime, *, namespace=None)` — persistent, cross-thread
**CompositeBackend**: `CompositeBackend(default, routes)` — routes by path prefix

Both StateBackend and StoreBackend require `runtime` → use factory pattern with `create_deep_agent(backend=lambda rt: ...)`.

### 1.6 Middleware Classes in deepagents (VERIFIED)
- `FilesystemMiddleware` — file operations + context eviction
- `SubAgentMiddleware` — task tool for subagent delegation
- `SummarizationMiddleware` — context compression
- `SkillsMiddleware` — progressive disclosure of skills
- `MemoryMiddleware` — AGENTS.md memory loading

---

## Step 4 — Reconciliation Checklist

| # | Check | Prompt says | Actual API | Match? |
|---|-------|-------------|------------|--------|
| 1 | Subagent dict key for prompt | `system_prompt` (§Subagents) | `system_prompt` (required key) | ✅ YES |
| 2 | Middleware base class import | `from langchain.agents.middleware import AgentMiddleware` | `from langchain.agents.middleware.types import AgentMiddleware` | ❌ CLOSE — different submodule |
| 3 | Middleware has `modify_model_request` hook | Yes (§Middleware) | **NO** — use `awrap_model_call` | ❌ WRONG |
| 4 | `before_model` / `after_model` signature | `(request: ModelRequest) -> ModelRequest` | `(state, runtime) -> dict | None` | ❌ DIFFERENT |
| 5 | CompositeBackend constructor | `(default=..., routes={...})` | `(default=..., routes={...})` | ✅ YES |
| 6 | StateBackend/StoreBackend constructor | No runtime arg shown | Requires `runtime: ToolRuntime` | ❌ FACTORY NEEDED |

### Resolution for each mismatch:

**#2**: Use `from langchain.agents.middleware.types import AgentMiddleware`

**#3**: Arabic middleware's language detection will use `awrap_model_call` which intercepts the full model request/response cycle.

**#4**: `before_model` and `after_model` receive `(state, runtime)` and return state update dicts. For output inspection, access `state["messages"][-1]` in `after_model`. For pre-model injection, return state updates from `before_model`.

**#6**: Use factory pattern: `backend=lambda rt: CompositeBackend(default=StateBackend(rt), routes={"/memories/": StoreBackend(rt)})`

---

## Step 5 — Discovery Summary

### What maps cleanly:
- `create_deep_agent` replaces `build_supervisor_graph()` — direct replacement
- 6 subagents → `SubAgent` TypedDict dicts with `system_prompt` key
- `CompositeBackend` + `StateBackend` + `StoreBackend` → factory pattern
- Skills → SKILL.md files in backend paths
- Memory → AGENTS.md files via `memory` parameter
- SSE streaming → `astream_events` on CompiledStateGraph (native LangGraph)
- Checkpointing → `PostgresSaver` via `checkpointer` param
- Cross-thread persistence → `PostgresStore` via `store` param

### What needs adaptation:
- Middleware hooks use `(state, runtime)` pattern, not `ModelRequest/ModelResponse`
- No `modify_model_request` — use `awrap_model_call` for request interception
- Backend constructors need `runtime` — use lambda factory
- Current middleware operates on plain strings — needs adapting to state-based hooks

### Risk areas:
- Existing middleware operates post-hoc on response strings; new middleware operates inside the agent loop on state
- Clinical safety and PII middleware must inspect `state["messages"][-1]` content
- Arabic middleware must detect language from user message in `before_model` and inject into system prompt

---

## Ready to proceed: YES

All APIs verified via `help()` introspection on `deepagents==0.4.3`.
All 6 reconciliation checks completed with documented resolutions.
