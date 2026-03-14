"use client";

import { useCallback, useRef, useState } from "react";
import { streamChat, type Citation } from "@/lib/api";
import CitationChip from "./CitationChip";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  status?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [statusText, setStatusText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStatusText(null);

    // Append a placeholder assistant message that we update as tokens arrive
    const assistantIdx = messages.length + 1; // index after the user message
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);

    let streamedCitations: Citation[] = [];

    try {
      await streamChat(userMsg.content, sessionId, {
        onSession(sid) {
          setSessionId(sid);
        },
        onText(token) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[assistantIdx];
            if (last) {
              updated[assistantIdx] = {
                ...last,
                content: last.content + token,
              };
            }
            return updated;
          });
          scrollToBottom();
        },
        onCitations(citations) {
          streamedCitations = citations;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[assistantIdx];
            if (last) {
              updated[assistantIdx] = { ...last, citations };
            }
            return updated;
          });
        },
        onStatus(message) {
          setStatusText(message);
        },
        onDone() {
          setStatusText(null);
          // Ensure citations are set on final message
          if (streamedCitations.length > 0) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[assistantIdx];
              if (last) {
                updated[assistantIdx] = {
                  ...last,
                  citations: streamedCitations,
                };
              }
              return updated;
            });
          }
        },
        onError(message) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[assistantIdx];
            if (last) {
              updated[assistantIdx] = {
                ...last,
                content: last.content || `Error: ${message}`,
              };
            }
            return updated;
          });
        },
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[assistantIdx];
        if (last) {
          updated[assistantIdx] = {
            ...last,
            content: `Error: ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      setStatusText(null);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--dall-teal)] to-[var(--dall-teal-dark)] flex items-center justify-center text-white text-2xl font-bold mb-4">
              D
            </div>
            <h2 className="text-xl font-semibold text-dall-900 dark:text-dall-100 mb-2">
              DentDall AI Tutor
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Ask me anything about dental science, the SDLE exam, or start a
              practice quiz. Every answer comes with textbook citations.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {[
                "What are the types of composite resins?",
                "Explain the biological width",
                "Start a quiz on Oral Pathology",
                "How ready am I for the SDLE?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-2 text-sm text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-dall-50 dark:hover:bg-dall-900/30 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-dall-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {msg.citations
                    .filter((c) => c.verified)
                    .map((citation, j) => (
                      <CitationChip key={j} citation={citation} />
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                {statusText ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {statusText}
                  </span>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-dall-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-dall-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-dall-500 animate-bounce" />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask a dental question..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dall-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-dall-600 text-white rounded-xl font-medium hover:bg-dall-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
