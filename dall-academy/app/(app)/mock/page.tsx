'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { sectionLabel } from '@/lib/utils'

type Phase = 'intro' | 'section1' | 'break' | 'section2' | 'results'

interface MockQuestion {
  id: string
  questionId: string
  order: number
  question: {
    id: string
    qnum: string
    section: string
    textEn: string
    options: Record<string, string>
    correctKey: string
    explanationEn: string
    reference: string
  }
  flagged: boolean
}

interface Results {
  score: number
  rawScore: number
  totalQ: number
  passed: boolean
  sectionBreakdown: Record<string, { correct: number; total: number }>
}

export default function MockPage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [allItems, setAllItems] = useState<MockQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>({} as unknown as Set<string>)
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120 * 60) // 120 min
  const [breakTimeLeft, setBreakTimeLeft] = useState(30 * 60)
  const [startTime] = useState(Date.now())
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)

  // Timer
  useEffect(() => {
    if (phase !== 'section1' && phase !== 'section2') return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          if (phase === 'section1') setPhase('break')
          else submitExam()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  // Break timer
  useEffect(() => {
    if (phase !== 'break') return
    const timer = setInterval(() => {
      setBreakTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setPhase('section2')
          setTimeLeft(120 * 60)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  async function startExam() {
    setLoading(true)
    try {
      const res = await fetch('/api/mock/start', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAttemptId(data.attemptId)
      // Mock data fetch (in real app would fetch items)
      toast.success('Exam started! Good luck 🎯')
      setPhase('section1')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to start exam')
    } finally {
      setLoading(false)
    }
  }

  const submitExam = useCallback(async () => {
    if (!attemptId) return
    setLoading(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const res = await fetch('/api/mock/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers, timeTaken }),
      })
      const data = await res.json()
      setResults(data)
      setPhase('results')
    } catch {
      toast.error('Failed to submit exam')
    } finally {
      setLoading(false)
    }
  }, [attemptId, answers, startTime])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const sectionItems = phase === 'section2' ? allItems.slice(100) : allItems.slice(0, 100)
  const currentItem = sectionItems[currentQ]

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--dark-bg)' }}>
        <div className="glass-card p-10 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-white font-display mb-2">SDLE Mock Exam</h1>
            <p className="text-gray-400">Full simulation · 200 questions · 4 hours</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '200', sub: 'Total Questions' },
              { label: '2', sub: 'Sections' },
              { label: '4h', sub: 'Total Time' },
              { label: '542', sub: 'Passing Score' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(74,143,163,0.1)' }}>
                <div className="text-2xl font-bold font-mono" style={{ color: '#4A8FA3' }}>{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-xl mb-6 text-sm text-gray-400 leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <strong className="text-white">Exam structure:</strong> Section 1 (Q1–100, 120 min) → 30 min break → Section 2 (Q101–200, 120 min).
            Score scaled 200–800. Passing score: 542. Up to 10 questions may be unscored pilot items.
          </div>

          <div className="flex gap-3">
            <button
              onClick={startExam}
              className="btn-primary flex-1 text-lg py-4"
              disabled={loading}
            >
              {loading ? 'Preparing exam…' : 'Start Exam →'}
            </button>
            <Link href="/dashboard" className="btn-ghost px-6 py-4">
              Back
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // BREAK
  if (phase === 'break') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark-bg)' }}>
        <div className="glass-card p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">☕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Section 1 Complete!</h2>
          <p className="text-gray-400 mb-6">Take your 30-minute break. Section 2 starts automatically.</p>
          <div className="text-5xl font-bold font-mono mb-6" style={{ color: '#4A8FA3' }}>
            {formatTime(breakTimeLeft)}
          </div>
          <button
            onClick={() => { setPhase('section2'); setTimeLeft(120 * 60) }}
            className="btn-primary w-full"
          >
            Skip Break → Start Section 2
          </button>
        </div>
      </div>
    )
  }

  // RESULTS
  if (phase === 'results' && results) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--dark-bg)' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card p-10 text-center">
            <div className="text-6xl font-bold font-display mb-2" style={{ color: results.passed ? '#4ade80' : '#f87171' }}>
              {results.score}
            </div>
            <div
              className="inline-block px-6 py-2 rounded-full text-lg font-bold mb-4"
              style={{
                background: results.passed ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                color: results.passed ? '#4ade80' : '#f87171',
              }}
            >
              {results.passed ? '✓ PASS' : '✗ FAIL'}
            </div>
            <p className="text-gray-400 text-sm">Passing score: 542/800</p>
            <p className="text-gray-500 text-sm mt-2">
              {results.rawScore}/{results.totalQ} correct · Scaled: {results.score}/800
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-4">Section Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(results.sectionBreakdown).map(([sec, data]) => {
                const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                return (
                  <div key={sec} className="flex items-center gap-4">
                    <span className="text-sm text-gray-300 w-40">{sectionLabel(sec)}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: acc >= 60 ? '#4ade80' : acc >= 40 ? '#fbbf24' : '#f87171',
                          width: `${acc}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-mono text-gray-400 w-16 text-right">
                      {data.correct}/{data.total} ({acc}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-primary flex-1 text-center py-3">
              Dashboard
            </Link>
            <button
              onClick={() => { setPhase('intro'); setResults(null); setAnswers({}); setCurrentQ(0) }}
              className="btn-ghost flex-1"
            >
              New Mock
            </button>
          </div>
        </div>
      </div>
    )
  }

  // EXAM (section1 / section2)
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--dark-bg)' }}>
      {/* Sticky header */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 flex-wrap gap-y-2"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-white font-semibold text-sm">
          {phase === 'section1' ? 'Section 1' : 'Section 2'} of 2
        </span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-400 text-sm">{currentQ + 1}/100 answered</span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-400 text-sm">
          {Array.from(flagged).filter((id) => sectionItems.some((i) => i.id === id)).length} flagged
        </span>

        <div className="ml-auto flex items-center gap-4">
          <div
            className="text-xl font-bold font-mono"
            style={{ color: timeLeft < 600 ? '#f87171' : '#4A8FA3' }}
          >
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => {
              if (phase === 'section1') setPhase('break')
              else submitExam()
            }}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ background: '#4A8FA3', color: 'white' }}
          >
            {phase === 'section1' ? 'Submit Section 1' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full transition-all"
          style={{ background: '#4A8FA3', width: `${((currentQ + 1) / 100) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
          {currentItem ? (
            <>
              <div className="text-xs text-gray-500 font-mono mb-4">
                Q{currentItem.order} · {sectionLabel(currentItem.question.section)}
              </div>
              <div
                className="text-white text-base leading-relaxed mb-6 p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {currentItem.question.textEn}
              </div>
              <div className="space-y-3">
                {Object.entries(currentItem.question.options as Record<string, string>).map(([k, v]) => {
                  const isSelected = answers[currentItem.id] === k
                  return (
                    <button
                      key={k}
                      onClick={() => setAnswers((a) => ({ ...a, [currentItem.id]: k }))}
                      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(74,143,163,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `${isSelected ? 2 : 1}px solid ${isSelected ? '#4A8FA3' : 'rgba(255,255,255,0.1)'}`,
                        color: isSelected ? 'white' : '#d1d5db',
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: isSelected ? '#4A8FA3' : 'rgba(255,255,255,0.1)' }}
                      >
                        {k.toUpperCase()}
                      </span>
                      <span className="text-sm">{v}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="btn-ghost flex-1"
                  style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => {
                    const ids = new Set(flagged)
                    if (ids.has(currentItem.id)) ids.delete(currentItem.id)
                    else ids.add(currentItem.id)
                    setFlagged(ids)
                  }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: flagged.has(currentItem.id) ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                    color: flagged.has(currentItem.id) ? '#fbbf24' : '#6b7280',
                  }}
                >
                  🚩 {flagged.has(currentItem.id) ? 'Flagged' : 'Flag'}
                </button>
                <button
                  onClick={() => setCurrentQ((q) => Math.min(99, q + 1))}
                  disabled={currentQ === 99}
                  className="btn-primary flex-1"
                  style={{ opacity: currentQ === 99 ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center py-20">No questions loaded</div>
          )}
        </div>

        {/* Question grid */}
        <div
          className="w-56 flex-shrink-0 p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Questions</div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 100 }, (_, i) => {
              const item = sectionItems[i]
              const isAnswered = item && answers[item.id]
              const isFlagged = item && flagged.has(item.id)
              const isCurrent = i === currentQ
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className="w-8 h-8 rounded text-xs font-mono transition-all"
                  style={{
                    background: isCurrent
                      ? '#4A8FA3'
                      : isFlagged
                      ? 'rgba(251,191,36,0.3)'
                      : isAnswered
                      ? 'rgba(74,222,128,0.2)'
                      : 'rgba(255,255,255,0.06)',
                    color: isCurrent ? 'white' : isFlagged ? '#fbbf24' : isAnswered ? '#4ade80' : '#6b7280',
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: 'rgba(74,222,128,0.2)' }} />
              <span className="text-gray-500">Answered ({Object.keys(answers).filter((id) => sectionItems.some((i) => i.id === id)).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: 'rgba(251,191,36,0.3)' }} />
              <span className="text-gray-500">Flagged ({Array.from(flagged).filter((id) => sectionItems.some((i) => i.id === id)).length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
