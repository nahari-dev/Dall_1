'use client'

import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type MessageMode = 'mcq_answer' | 'mcq_generate' | 'explain' | 'general'

interface Message {
  role: 'user' | 'assistant'
  content: string
  topic?: string
  mode?: MessageMode
  feedbackGiven?: 'helpful' | 'not_helpful'
}

const MODE_BADGE: Record<MessageMode, { label: string; color: string }> = {
  mcq_generate: { label: 'MCQ Generated', color: '#7BC8A4' },
  mcq_answer:   { label: 'MCQ Answer',    color: '#A78BFA' },
  explain:      { label: 'Explanation',   color: '#4A8FA3' },
  general:      { label: 'General',       color: '#6b7280' },
}

const QUICK_ACTIONS = [
  { label: '🎲 Generate MCQ', text: 'Generate a practice MCQ question for me' },
  { label: '📋 Quiz me on Endo', text: 'Give me an MCQ question about endodontics' },
  { label: '📋 Quiz me on Perio', text: 'Give me an MCQ question about periodontics' },
  { label: '❓ Explain Pulpitis', text: 'Explain the difference between reversible and irreversible pulpitis' },
  { label: '❓ High-yield topics', text: 'What are the most high-yield SDLE topics I should focus on?' },
  { label: '❓ FDI Numbering', text: 'Explain FDI tooth numbering system' },
]

export default function GuiderPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const content = text ?? input.trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
          topic: data.topic,
          mode: data.mode as MessageMode,
        },
      ])
    } catch {
      toast.error('Failed to get response. Try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  async function sendFeedback(msgIndex: number, rating: 'helpful' | 'not_helpful') {
    const msg = messages[msgIndex]
    if (!msg || msg.feedbackGiven) return

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, feedbackGiven: rating } : m)),
    )

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: msg.topic ?? 'general', rating }),
      })
      toast.success(rating === 'helpful' ? 'Thanks! I\'ll keep this up 👍' : 'Got it — I\'ll try a different approach next time 👎')

      // If not helpful, automatically trigger a follow-up with a different angle
      if (rating === 'not_helpful' && msg.topic) {
        send(`Please re-explain ${msg.topic} from a different angle or using a different analogy`)
      }
    } catch {
      // Revert on error
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, feedbackGiven: undefined } : m)),
      )
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--dark-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4A8FA3, #1A1A2E)' }}
          >
            🧠
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Dall SDLE Guider</div>
            <div className="text-xs text-gray-500">AI Tutor · SCFHS Referenced</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 ml-1" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9ca3af',
            }}
          >
            {lang === 'en' ? 'EN → عر' : 'عر → EN'}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="text-center py-10 animate-fade-in">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-xl font-bold text-white mb-2">Dall SDLE Guider</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Ask a question, paste an MCQ for me to answer, or generate a practice question.
              Every answer is referenced from SCFHS-approved textbooks.
            </p>

            {/* Quick action chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.text}
                  onClick={() => send(a.text)}
                  className="text-xs px-3 py-2 rounded-full transition-all"
                  style={{
                    background: 'rgba(74,143,163,0.15)',
                    border: '1px solid rgba(74,143,163,0.3)',
                    color: '#7BB3C4',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-6">
              💡 You can also paste any MCQ and I will answer it, explain all options, and flag any item-writing flaws.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const badge = msg.mode && msg.role === 'assistant' ? MODE_BADGE[msg.mode] : null
          return (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #4A8FA3, #1A1A2E)' }}
                >
                  🧠
                </div>
              )}
              <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Topic + mode badges */}
                {msg.role === 'assistant' && (msg.topic || badge) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {msg.topic && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,143,163,0.2)', color: '#7BB3C4' }}
                      >
                        {msg.topic}
                      </span>
                    )}
                    {badge && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${badge.color}22`, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: msg.role === 'user' ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? 'white' : '#e5e7eb',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    direction: lang === 'ar' ? 'rtl' : 'ltr',
                  }}
                >
                  {msg.content}
                </div>

                {/* Feedback buttons — assistant messages only */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {msg.feedbackGiven ? (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {msg.feedbackGiven === 'helpful' ? '👍 Marked helpful' : '👎 Marked not helpful'}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs mr-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Was this helpful?
                        </span>
                        <button
                          onClick={() => sendFeedback(i, 'helpful')}
                          className="text-xs px-2 py-0.5 rounded-md transition-all hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          title="Helpful"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => sendFeedback(i, 'not_helpful')}
                          className="text-xs px-2 py-0.5 rounded-md transition-all hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          title="Not helpful"
                        >
                          👎
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A8FA3, #1A1A2E)' }}
            >
              🧠
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px' }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{
                    background: '#4A8FA3',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-4"
        style={{ background: 'var(--sidebar-bg)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="flex gap-3 items-end p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <textarea
              className="flex-1 bg-transparent text-white text-sm resize-none outline-none max-h-32 min-h-[40px]"
              placeholder="Ask about any SDLE topic…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={1}
              style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !loading ? '#4A8FA3' : 'rgba(255,255,255,0.1)',
                color: input.trim() && !loading ? 'white' : '#6b7280',
              }}
            >
              ↑
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Referenced from SCFHS-approved textbooks · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
