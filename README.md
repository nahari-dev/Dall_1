# Dall Academy

AI-powered healthcare exam preparation platform. The first module, **DentDall**, targets the Saudi Dental Licensing Exam (SDLE).

Built on the [Deep Agents](https://github.com/langchain-ai/deepagents) library (LangChain / LangGraph) with provider-agnostic model loading.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Provider-Agnostic Model Loading](#provider-agnostic-model-loading)
- [Quick Start](#quick-start)
- [Deep Agents Subagents](#deep-agents-subagents)
- [System Prompts](#system-prompts)
- [Middleware Stack](#middleware-stack)
- [Streaming Architecture](#streaming-architecture)
- [API Endpoints](#api-endpoints)
- [State Schema](#state-schema)
- [Development Guide](#development-guide)
- [Coding Agent Guide](#coding-agent-guide)

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────────────┐
│   Next.js    │────▶│   FastAPI     │────▶│   Deep Agents Core          │
│   Frontend   │◀────│   Backend     │◀────│   (create_deep_agent)       │
└──────────────┘ SSE └──────────────┘     └─────────────────────────────┘
                           │                         │
                     ┌─────┴─────┐          ┌────────┴────────┐
                     │ PostgreSQL│          │   Subagents      │
                     │   Redis   │          │  ├─ Knowledge    │
                     │  ChromaDB │          │  ├─ ExamPattern  │
                     │   MinIO   │          │  ├─ Citation     │
                     └───────────┘          │  ├─ StudentProf  │
                                            │  ├─ Quiz         │
                                            │  └─ Readiness    │
                                            └─────────────────┘
```

**Three layers:**
1. **Next.js Frontend** — Chat UI with SSE streaming, quiz interface, dashboard, study plan calendar
2. **FastAPI Backend** — API gateway, JWT auth, rate limiting, SSE streaming bridge
3. **Deep Agents Core** — `create_deep_agent()` supervisor orchestrating 6 specialised subagents, with built-in planning, file operations, and context management

---

## Project Structure

```
dall-academy/
├── agents/                      # Deep Agents core — the AI brain
│   ├── supervisor.py            # create_deep_agent() configuration & dall_supervisor instance
│   ├── config.py                # Pydantic settings (LLM_MODEL, DB, Redis, ChromaDB, MinIO)
│   ├── state.py                 # DallState TypedDict + QuizState (LangGraph shared state)
│   ├── subagent_configs.py      # 6 SubAgent dicts (knowledge, exam, citation, profile, quiz, readiness)
│   ├── middleware_stack.py      # 5 custom AgentMiddleware classes + get_middleware_stack()
│   ├── prompts.py               # All system prompts — supervisor + all 6 subagents
│   ├── skills/                  # Progressive-disclosure knowledge (SKILL.md files)
│   │   ├── arabic-dental-terms/ # Arabic dental vocabulary + RTL formatting
│   │   ├── dental-anatomy/      # Anatomical structures + terminology
│   │   ├── pharmacology-safety/ # Drug interactions + dosing
│   │   ├── sdle-exam-format/    # SDLE exam structure + scoring
│   │   ├── socratic-tutoring/   # Hint strategy + scaffolding patterns
│   │   └── study-plan-templates/# Time allocation + spaced repetition
│   ├── tools/                   # Domain tools (@tool decorated LangChain tools)
│   │   ├── knowledge_tools.py   # chromadb_search, citation_formatter, source_index_search
│   │   ├── exam_tools.py        # exam_stats_query, topic_frequency_analyzer, difficulty_trend_tool
│   │   ├── quiz_tools.py        # question_selector, hint_generator, explanation_builder, answer_evaluator
│   │   ├── profile_tools.py     # profile_reader, proficiency_updater, learning_style_detector
│   │   └── readiness_tools.py   # readiness_calculator, gap_analyzer, study_plan_generator, calendar_scheduler
│   └── backends/                # Storage adapters: postgres_store, redis_state, s3_filesystem
├── backend/                     # FastAPI application
│   ├── main.py                  # App entry point — CORS, router mounting, lifespan hooks
│   ├── routers/                 # Route handlers: auth, chat, quiz, analytics, admin
│   │   ├── auth.py              # /api/auth/* — register, login, /me
│   │   ├── chat.py              # /api/chat — non-streaming + SSE streaming endpoints
│   │   ├── quiz.py              # /api/quiz/* — start, answer, hint, results
│   │   ├── analytics.py         # /api/analytics/* — performance, readiness, study-plan
│   │   └── admin.py             # /api/admin/* — institutional analytics (admin role only)
│   ├── models/                  # SQLAlchemy ORM (database.py) + Pydantic v2 schemas (schemas.py)
│   ├── services/                # Business logic layer
│   │   ├── agent_service.py     # Bridge between FastAPI and the Deep Agents supervisor
│   │   ├── auth_service.py      # JWT creation, password hashing, user lookup
│   │   └── rate_limiter.py      # Redis-backed per-user rate limiting
│   └── middleware/              # FastAPI middleware: security headers, PDPL compliance
├── frontend/                    # Next.js 14 App Router
│   ├── app/                     # Pages: landing (/), chat, quiz, dashboard, study-plan, library, admin
│   ├── components/              # ChatInterface (SSE), CitationChip, QuizCard, ReadinessGauge, etc.
│   └── lib/                     # API client (sendChat + streamChat), auth utilities
├── data/                        # Seed questions and textbook chunks for ChromaDB ingestion
├── docker-compose.yml           # PostgreSQL, Redis, ChromaDB, MinIO, backend, frontend services
└── pyproject.toml               # Python dependencies (deepagents, langchain, fastapi, etc.)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Agent Framework | [Deep Agents](https://github.com/langchain-ai/deepagents) (LangChain + LangGraph) |
| LLM | Provider-agnostic — defaults to `anthropic:claude-sonnet-4-20250514`, switchable via `LLM_MODEL` |
| Embeddings | `text-embedding-3-small` (OpenAI) |
| Vector Store | ChromaDB (`dental_knowledge` collection) |
| Backend | FastAPI + SQLAlchemy (async) + Pydantic v2 |
| Frontend | Next.js 14 App Router + Tailwind CSS + React Query + Recharts |
| Database | PostgreSQL 16 |
| Cache / Rate Limit | Redis 7 |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT with refresh tokens, role-based (student / faculty / admin) |
| Compliance | Saudi PDPL, AES-256 encryption at rest |
| Python | 3.11+, ruff (lint), mypy (strict) |

---

## Provider-Agnostic Model Loading

The platform uses the `provider:model` format supported by Deep Agents and `langchain.chat_models.init_chat_model`. Switch providers by changing a single environment variable:

```bash
# Anthropic (default)
LLM_MODEL=anthropic:claude-sonnet-4-20250514

# OpenAI
LLM_MODEL=openai:gpt-4o

# Google
LLM_MODEL=google-genai:gemini-2.0-flash
```

Set the corresponding API key (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`) for the chosen provider.

All 6 subagents inherit the top-level `LLM_MODEL`. To override a single subagent, set a different `model` value in its dict inside `agents/subagent_configs.py`.

---

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env
# Edit .env with your API key and desired model

# 2. Start infrastructure
docker compose up -d postgres redis chromadb minio

# 3. Run the backend
pip install -e .
uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload

# 4. Run the frontend
cd frontend && npm install && npm run dev
```

Or run everything via Docker:

```bash
docker compose up --build
```

---

## Deep Agents Subagents

Subagents are configured in `agents/subagent_configs.py` and instantiated via `get_subagents()`.

| Agent name | File | Purpose |
|---|---|---|
| `knowledge-agent` | `subagent_configs.py` | RAG pipeline over dental textbooks (ChromaDB) with mandatory citations |
| `exam-pattern-agent` | `subagent_configs.py` | SDLE trend analysis — topic frequency, difficulty trends, high-yield areas |
| `citation-agent` | `subagent_configs.py` | Verification layer — cross-checks claims against indexed sources |
| `student-profile-agent` | `subagent_configs.py` | Adaptive personalisation — proficiency level, weak topics, learning style |
| `quiz-agent` | `subagent_configs.py` | Interactive assessment with Socratic hints and detailed explanations |
| `readiness-agent` | `subagent_configs.py` | BDI-style exam readiness evaluator with study plan generation |

**Routing logic** (in `agents/prompts.py` → `DALL_SUPERVISOR_PROMPT`):

- Any factual dental question → `knowledge-agent` (never answer from built-in knowledge)
- SDLE trends / what to study → `exam-pattern-agent`
- After knowledge-agent responds on clinical topics → `citation-agent` (mandatory)
- Before personalised responses → `student-profile-agent`
- Practice / quiz requests → `quiz-agent`
- Readiness / study plan requests → `readiness-agent`

---

## System Prompts

All prompts live in `agents/prompts.py`. Each constant maps 1-to-1 to a subagent:

| Constant | Used by |
|---|---|
| `DALL_SUPERVISOR_PROMPT` | `dall_supervisor` (top-level orchestrator) |
| `KNOWLEDGE_AGENT_PROMPT` | `knowledge-agent` |
| `EXAM_PATTERN_PROMPT` | `exam-pattern-agent` |
| `CITATION_VERIFICATION_PROMPT` | `citation-agent` |
| `STUDENT_PROFILE_PROMPT` | `student-profile-agent` |
| `QUIZ_AGENT_PROMPT` | `quiz-agent` |
| `READINESS_AGENT_PROMPT` | `readiness-agent` |

### Supervisor prompt summary

`DALL_SUPERVISOR_PROMPT` instructs the supervisor to:
- Delegate ALL factual questions to `knowledge-agent` (never self-answer)
- Always run `citation-agent` after `knowledge-agent` on clinical topics
- Use `write_todos` for multi-step planning
- Write session summaries to `/memories/sessions/`
- Read student profiles from `/student-profiles/{student_id}/profile.json`
- Respond in the student's language (Arabic or English)
- Always include "This is for exam preparation only" disclaimer on clinical topics

### Subagent prompt summaries

**KnowledgeAgent** — chromadb_search first, every claim must have `[Source: Book Title, Chapter X, p. Y]`, never fabricate.

**ExamPatternAgent** — use `exam_stats_query` tool, identify high-yield topics, provide actionable study recommendations.

**CitationAgent** — use `source_index_search`, rate each claim with confidence 0.0–1.0, flag unverified claims, end with a verification summary.

**StudentProfileAgent** — load profile via `profile_reader`, update via `proficiency_updater`, detect style via `learning_style_detector`, return full profile + recommendations.

**QuizAgent** — `question_selector` weighted to weak topics, Socratic hints only (never reveal answer), `explanation_builder` after each answer, track session state.

**ReadinessAgent** — BDI framework: `readiness_calculator` (beliefs) → `gap_analyzer` (desires) → `study_plan_generator` (intentions) → `calendar_scheduler`.

---

## Middleware Stack

Custom middleware in `agents/middleware_stack.py`, passed to `create_deep_agent(middleware=[...])`. Runs AFTER the built-in Deep Agents stack (TodoList, Filesystem, SubAgent, Summarization).

| Class | Hook | Purpose |
|---|---|---|
| `AdaptiveDifficultyMiddleware` | `abefore_model` | Injects beginner/advanced context based on proficiency from profile tool results |
| `ArabicLocalizationMiddleware` | `abefore_model` / `aafter_model` | Detects Arabic input (≥30% Arabic chars), injects language instruction, adds RTL mark to Arabic responses |
| `ClinicalSafetyMiddleware` | `aafter_model` | Regex-scans for dangerous clinical advice patterns, appends safety disclaimer |
| `HallucinationGuardMiddleware` | `aafter_model` | Flags responses with >3 uncited factual sentences, adds caveat |
| `PIIProtectionMiddleware` | `aafter_model` | Redacts Saudi national IDs, phone numbers, emails, credit card numbers (PDPL compliance) |

**Execution order:** AdaptiveDifficulty → ArabicLocalization → [Built-in middleware] → ClinicalSafety → HallucinationGuard → PIIProtection

---

## Streaming Architecture

The chat interface uses **Server-Sent Events (SSE)** for real-time token streaming:

1. **Frontend** (`ChatInterface.tsx`) calls `streamChat()` → `fetch` stream to `POST /api/chat/stream`
2. **Backend** (`agent_service.stream_chat()`) calls `dall_supervisor.astream_events(version="v2")`
3. **SSE events** emitted in order:
   - `session` — session metadata (session ID)
   - `text` — incremental AI message tokens
   - `status` — progress updates (e.g. "Delegating to subagent...")
   - `citations` — verified citations extracted from the full response
   - `done` — signals end of stream
   - `error` — error payload

A non-streaming fallback is available at `POST /api/chat`.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check for Docker / load balancer probes |
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | JWT authentication |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/chat` | Chat (non-streaming) |
| POST | `/api/chat/stream` | Chat (SSE streaming) |
| POST | `/api/quiz/start` | Start quiz session |
| POST | `/api/quiz/answer` | Submit answer |
| POST | `/api/quiz/hint` | Request Socratic hint |
| GET | `/api/quiz/results/:id` | Quiz results |
| GET | `/api/analytics` | Student performance data |
| GET | `/api/analytics/readiness` | Exam readiness report |
| GET | `/api/analytics/study-plan` | Personalised study plan |
| GET | `/api/admin/analytics` | Institutional analytics (admin role) |

---

## State Schema

Defined in `agents/state.py`.

```python
class DallState(TypedDict, total=False):
    messages: Annotated[list, add_messages]  # LangGraph reducer — safe parallel appends
    student_id: str                           # Authenticated student identifier
    intent: str                               # Classified intent of latest query
    knowledge_results: list[dict]             # RAG results from KnowledgeAgent
    exam_patterns: dict                       # Trend data from ExamPatternAgent
    student_profile: dict                     # Personalisation context from StudentProfileAgent
    citations: list[dict]                     # Verified citations from CitationAgent
    final_response: str                       # Merged, citation-tagged answer
    quiz_state: Optional[QuizState]           # Active quiz session (nullable)
    readiness: Optional[dict]                 # Readiness evaluation (nullable)
    error: Optional[str]                      # Error message if processing failed
```

Storage routing (via `CompositeBackend` in `supervisor.py`):
- `/` (default) → `StateBackend` — ephemeral per-thread
- `/memories/` → `StoreBackend` — cross-thread durable (PostgresStore)
- `/student-profiles/` → `StoreBackend` — persistent student data

---

## Development Guide

### Install dependencies

```bash
pip install -e ".[dev]"
```

### Lint and type-check

```bash
ruff check .          # Linting
ruff format .         # Formatting (line length 100, Python 3.11 target)
mypy .                # Strict type checking
```

### Run tests

```bash
pytest tests/ -v
pytest --asyncio-mode=auto  # For async tests (pytest-asyncio)
```

### Environment variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `LLM_MODEL` | `anthropic:claude-sonnet-4-20250514` | Provider:model string |
| `ANTHROPIC_API_KEY` | — | Required if using Anthropic |
| `OPENAI_API_KEY` | — | Required if using OpenAI |
| `GOOGLE_API_KEY` | — | Required if using Google |
| `DATABASE_URL` | `postgresql+asyncpg://dall_user:dall_password@localhost:5432/dall_academy` | Postgres connection |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `CHROMA_HOST` | `localhost` | ChromaDB host |
| `CHROMA_PORT` | `8000` | ChromaDB port |
| `CHROMA_COLLECTION` | `dental_knowledge` | ChromaDB collection name |
| `S3_ENDPOINT_URL` | `http://localhost:9000` | MinIO / S3 endpoint |
| `S3_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `S3_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `S3_BUCKET_NAME` | `dall-academy` | MinIO bucket |
| `RAG_TOP_K` | `8` | Number of chunks retrieved per RAG query |
| `RAG_RELEVANCE_THRESHOLD` | `0.65` | Minimum similarity score for RAG results |
| `SDLE_PASS_SCORE` | `70` | Pass mark percentage for SDLE |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Adding a new subagent

1. Write the system prompt constant in `agents/prompts.py`
2. Implement domain tools in `agents/tools/<name>_tools.py` using `@tool` decorator
3. Add the subagent dict to the list in `agents/subagent_configs.py → get_subagents()`
4. Add routing instructions to `DALL_SUPERVISOR_PROMPT` in `agents/prompts.py`
5. Optionally add skills (SKILL.md files) in `agents/skills/<name>/`

### Adding a new API endpoint

1. Add the route handler in the appropriate `backend/routers/*.py` file
2. Add request/response Pydantic models in `backend/models/schemas.py`
3. Add business logic in `backend/services/`
4. Mount the router in `backend/main.py` if adding a new router file

### Adding middleware

1. Subclass `AgentMiddleware` from `langchain.agents.middleware.types`
2. Implement `abefore_model` and/or `aafter_model` async methods
3. Return `{"messages": [...]}` to modify state, or `None` to pass through
4. Add the instance to the list in `agents/middleware_stack.py → get_middleware_stack()`

---

## Coding Agent Guide

This section provides prompts and context specifically for AI coding agents (Claude Code, Cursor, GitHub Copilot, etc.) to orient themselves and work effectively on this repository.

### Quick orientation prompt

Paste this into your coding agent when starting a new session:

```
This is Dall Academy — an AI-powered exam prep platform for the Saudi Dental Licensing Exam (SDLE).

Key facts:
- Language: Python 3.11+ (backend/agents), TypeScript (Next.js 14 frontend)
- Agent framework: Deep Agents (deepagents library) built on LangChain + LangGraph
- Entry point: agents/supervisor.py — dall_supervisor is the compiled LangGraph agent
- All AI prompts: agents/prompts.py — edit here to change agent behaviour
- Subagent definitions: agents/subagent_configs.py — get_subagents() returns all 6
- Domain tools: agents/tools/*.py — @tool decorated LangChain tools
- Backend API: backend/main.py + backend/routers/*.py (FastAPI)
- Bridge between API and agents: backend/services/agent_service.py
- Config/env vars: agents/config.py (AgentConfig Pydantic settings)
- Shared state: agents/state.py (DallState TypedDict)
- Custom middleware: agents/middleware_stack.py (5 AgentMiddleware subclasses)

Conventions:
- All imports use `from __future__ import annotations`
- Async throughout (asyncio, async SQLAlchemy, async FastAPI)
- Pydantic v2 for all schemas
- ruff for formatting (line length 100), mypy strict for type checking
- Never answer dental questions from built-in knowledge — always delegate to knowledge-agent
```

### Task-specific prompts

#### Modifying agent behaviour

```
To change how the supervisor routes tasks, edit DALL_SUPERVISOR_PROMPT in agents/prompts.py.
To change a subagent's behaviour, edit the corresponding *_PROMPT constant in agents/prompts.py.
Subagent tool lists are in agents/subagent_configs.py → get_subagents().
Skills (SKILL.md progressive-disclosure files) are in agents/skills/.
```

#### Adding or editing a tool

```
Tools live in agents/tools/. Each tool is a Python function decorated with @tool from langchain_core.tools.
Tools must be async if they perform I/O (chromadb queries, DB reads, etc.).
After adding a tool, register it in the relevant subagent's "tools" list in agents/subagent_configs.py.
The supervisor itself also has direct access to: chromadb_search, question_selector (see supervisor.py).
```

#### Working on the FastAPI backend

```
Backend entry point: backend/main.py
Routers: backend/routers/ — auth.py, chat.py, quiz.py, analytics.py, admin.py
The agent bridge is backend/services/agent_service.py — it calls dall_supervisor.ainvoke() or .astream_events()
Models: backend/models/database.py (SQLAlchemy ORM), backend/models/schemas.py (Pydantic v2)
Auth: JWT in backend/services/auth_service.py
Rate limiting: Redis-backed in backend/services/rate_limiter.py
```

#### Working on the middleware

```
All 5 middleware classes are in agents/middleware_stack.py.
Middleware must subclass AgentMiddleware from langchain.agents.middleware.types.
Hooks: abefore_model (runs before LLM call), aafter_model (runs after LLM call).
Return {"messages": [new_message]} to modify state, or None to pass through unchanged.
Execution order: AdaptiveDifficulty → ArabicLocalization → [built-in] → ClinicalSafety → HallucinationGuard → PIIProtection
```

#### Working on the frontend

```
Framework: Next.js 14 App Router (TypeScript)
Pages: frontend/app/ — landing (page.tsx), /chat, /quiz, /dashboard, /study-plan, /library, /admin
Components: frontend/components/ — ChatInterface.tsx handles SSE streaming
API client: frontend/lib/ — sendChat() for non-streaming, streamChat() for SSE
SSE events the frontend expects: session, text, status, citations, done, error
Styling: Tailwind CSS
```

#### Debugging agent flow

```
The LangGraph graph is compiled inside create_deep_agent() in agents/supervisor.py.
To trace execution: set debug=True in create_deep_agent() call (supervisor.py line ~96).
State at each node is DallState (agents/state.py).
Tool results are appended to messages by LangGraph automatically.
For SSE debugging: backend/services/agent_service.py iterates astream_events(version="v2").
```

#### Running locally without Docker

```bash
# Start only infrastructure
docker compose up -d postgres redis chromadb minio

# Backend (from repo root)
pip install -e ".[dev]"
cp .env.example .env  # then add your API key
uvicorn backend.main:app --port 8080 --reload

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
# Frontend available at http://localhost:3000
# Backend API at http://localhost:8080
# API docs at http://localhost:8080/docs
```

### Key file map for agents

| What you want to change | File to edit |
|---|---|
| Supervisor routing logic / instructions | `agents/prompts.py` → `DALL_SUPERVISOR_PROMPT` |
| A subagent's behaviour | `agents/prompts.py` → `<NAME>_PROMPT` constant |
| Which tools a subagent has | `agents/subagent_configs.py` → `get_subagents()` |
| Add a new tool | `agents/tools/<name>_tools.py`, then register in `subagent_configs.py` |
| Add a new subagent | `agents/prompts.py` (new prompt) + `agents/subagent_configs.py` (new dict) |
| Middleware behaviour | `agents/middleware_stack.py` |
| Storage / memory routing | `agents/supervisor.py` → `_make_backend()` |
| Shared state fields | `agents/state.py` → `DallState` |
| Config / env vars | `agents/config.py` → `AgentConfig` |
| API routes | `backend/routers/*.py` |
| Agent ↔ API bridge | `backend/services/agent_service.py` |
| Auth logic | `backend/services/auth_service.py` |
| DB models | `backend/models/database.py` |
| API request/response schemas | `backend/models/schemas.py` |
| Frontend pages | `frontend/app/<page>/page.tsx` |
| SSE streaming client | `frontend/lib/` |
