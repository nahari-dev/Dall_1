/**
 * API client for the Dall Academy backend.
 *
 * All requests go to the FastAPI backend at the configured base URL.
 * Authentication is handled via JWT bearer tokens stored in localStorage.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Citation {
  claim?: string;
  verified?: boolean;
  source: string;
  confidence_score?: number;
}

export interface ChatResponse {
  response: string;
  citations: Citation[];
  session_id: string;
  intent: string;
}

export interface QuestionResponse {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  text: string;
  options: Record<string, string>;
  time_limit: number;
}

export interface QuizStartResponse {
  session_id: string;
  total_questions: number;
  current_question: QuestionResponse;
}

export interface AnswerFeedback {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  citations: Citation[];
  score_so_far: number;
  questions_remaining: number;
}

export interface QuizResultsResponse {
  session_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  topic_breakdown: Array<{ topic: string; correct: number; total: number }>;
  recommendations: string[];
}

export interface AnalyticsResponse {
  student_id: string;
  total_quizzes: number;
  average_score: number;
  topic_scores: Array<{ topic: string; score: number; quizzes: number }>;
  recent_sessions: Array<{
    date: string;
    topic: string;
    score: number;
    questions: number;
  }>;
  study_streak_days: number;
}

export interface ReadinessResponse {
  overall_readiness_pct: number;
  pass_score: number;
  on_track: boolean;
  topic_breakdown: Array<{
    topic: string;
    score: number;
    weight: number;
    status: string;
    gap: number;
  }>;
  days_until_ready: number;
}

export interface StudyPlanResponse {
  student_id: string;
  study_plan: Array<{
    day: number;
    date: string;
    topic: string;
    score: number;
    target: number;
    activities: string[];
  }>;
  generated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  const tokens = await apiFetch<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  return tokens;
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const tokens = await apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  return tokens;
}

export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function sendChat(
  message: string,
  sessionId?: string,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

/**
 * SSE event types emitted by the streaming chat endpoint.
 */
export type StreamEventType =
  | "session"
  | "text"
  | "citations"
  | "status"
  | "done"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  [key: string]: unknown;
}

/**
 * Callbacks for consuming an SSE chat stream.
 */
export interface StreamChatCallbacks {
  onSession?: (sessionId: string) => void;
  onText?: (token: string) => void;
  onCitations?: (citations: Citation[]) => void;
  onStatus?: (message: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

/**
 * Stream a chat response from the backend via SSE.
 *
 * Uses the native `fetch` API with a `ReadableStream` reader so it works in
 * all modern browsers without an EventSource polyfill for POST requests.
 */
export async function streamChat(
  message: string,
  sessionId: string | undefined,
  callbacks: StreamChatCallbacks,
): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const res = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>).detail ||
        `Request failed: ${res.status}`,
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE lines are separated by double newlines
    const parts = buffer.split("\n\n");
    // Keep the last (possibly incomplete) chunk in the buffer
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;

      const json = line.slice("data:".length).trim();
      if (!json) continue;

      let event: StreamEvent;
      try {
        event = JSON.parse(json) as StreamEvent;
      } catch {
        continue;
      }

      switch (event.type) {
        case "session":
          callbacks.onSession?.(event.session_id as string);
          break;
        case "text":
          callbacks.onText?.(event.content as string);
          break;
        case "citations":
          callbacks.onCitations?.(event.citations as Citation[]);
          break;
        case "status":
          callbacks.onStatus?.(event.message as string);
          break;
        case "done":
          callbacks.onDone?.();
          break;
        case "error":
          callbacks.onError?.(event.message as string);
          break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export async function startQuiz(
  topic?: string,
  difficulty?: string,
  numQuestions?: number,
): Promise<QuizStartResponse> {
  return apiFetch<QuizStartResponse>("/api/quiz/start", {
    method: "POST",
    body: JSON.stringify({
      topic,
      difficulty: difficulty || "medium",
      num_questions: numQuestions || 5,
    }),
  });
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string,
  timeSpent: number = 0,
): Promise<AnswerFeedback> {
  return apiFetch<AnswerFeedback>("/api/quiz/answer", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      time_spent: timeSpent,
    }),
  });
}

export async function getQuizHint(
  sessionId: string,
  questionId: string,
): Promise<{ hint: string; hint_number: number; max_hints: number }> {
  return apiFetch("/api/quiz/hint", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
    }),
  });
}

export async function getQuizResults(
  sessionId: string,
): Promise<QuizResultsResponse> {
  return apiFetch<QuizResultsResponse>(`/api/quiz/results/${sessionId}`);
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return apiFetch<AnalyticsResponse>("/api/analytics");
}

export async function getReadiness(): Promise<ReadinessResponse> {
  return apiFetch<ReadinessResponse>("/api/analytics/readiness");
}

export async function getStudyPlan(): Promise<StudyPlanResponse> {
  return apiFetch<StudyPlanResponse>("/api/analytics/study-plan");
}
