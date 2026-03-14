'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { sectionLabel } from '@/lib/utils'

interface Option {
  key: string
  text: string
}

interface Question {
  id: string
  qnum: string
  section: string
  difficulty: string
  textEn: string
  textAr?: string
  options: Record<string, string>
  correctKey: string
  explanationEn: string
  explanationAr?: string
  reference: string
  tags?: string[]
}

const ALL_SECTIONS = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']
const DIFFICULTIES = ['EASY', 'INTERMEDIATE', 'ADVANCED']

const difficultyColor: Record<string, string> = {
  EASY: '#4ade80',
  INTERMEDIATE: '#fbbf24',
  ADVANCED: '#f87171',
}

const sectionColor: Record<string, string> = {
  PERIODONTICS: '#4A8FA3',
  ENDODONTICS: '#7BB3C4',
  RESTORATIVE: '#2D6A7F',
  ORTHO_PEDO: '#5BA3B8',
  ORAL_MEDICINE: '#9AC8D5',
}

export default function QBankPage() {
  const [smartMode, setSmartMode] = useState(true)
  const [section, setSection] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [showSummary, setShowSummary] = useState(false)
  const [showArabic, setShowArabic] = useState(false)

  const currentQ = questions[currentIdx]

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (smartMode) {
        params.set('smart', 'true')
      } else {
        if (section) params.set('section', section)
        if (difficulty) params.set('difficulty', difficulty)
      }

      const res = await fetch(`/api/questions?${params}`)
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setCurrentIdx(0)
      setSelected(null)
      setRevealed(false)
      setStartTime(Date.now())
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [smartMode, section, difficulty])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  async function handleReveal() {
    if (!selected || !currentQ) return

    setRevealed(true)
    const isCorrect = selected === currentQ.correctKey
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    await fetch('/api/questions/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQ.id,
        selectedKey: selected,
        timeSpent,
      }),
    })

    setSessionStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))
  }

  function handleNext() {
    if (currentIdx >= questions.length - 1) {
      setShowSummary(true)
      return
    }
    setCurrentIdx((i) => i + 1)
    setSelected(null)
    setRevealed(false)
    setStartTime(Date.now())
  }

  function getOptionStyle(key: string) {
    if (!revealed) {
      return selected === key
        ? { background: 'rgba(74,143,163,0.25)', border: '2px solid #4A8FA3', color: 'white' }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#d1d5db' }
    }
    if (key === currentQ?.correctKey) {
      return { background: 'rgba(74,222,128,0.15)', border: '2px solid #4ade80', color: '#4ade80' }
    }
    if (key === selected) {
      return { background: 'rgba(248,113,113,0.15)', border: '2px solid #f87171', color: '#f87171' }
    }
    return { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#6b7280' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--dark-bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <div className="text-gray-400">Loading questions…</div>
        </div>
      </div>
    )
  }

  if (showSummary || questions.length === 0) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0

    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ background: 'var(--dark-bg)' }}>
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div>
              <div className="text-2xl font-bold font-mono text-white">{sessionStats.total}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: accuracy >= 60 ? '#4ade80' : '#f87171' }}>
                {accuracy}%
              </div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#4A8FA3' }}>{sessionStats.correct}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowSummary(false); setSessionStats({ correct: 0, total: 0 }); loadQuestions() }}
              className="btn-primary flex-1"
            >
              New Session
            </button>
            <Link href="/dashboard" className="btn-ghost flex-1 text-center py-3">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const options: Option[] = Object.entries(currentQ.options as Record<string, string>).map(([key, text]) => ({ key, text }))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--dark-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center gap-4 px-5 py-3 sticky top-0 z-10 flex-wrap gap-y-2"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-600">|</span>
        <span className="text-white font-semibold text-sm">Referenced Q-Bank</span>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          {/* Smart/Manual toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {[{ v: true, l: 'Smart' }, { v: false, l: 'Manual' }].map(({ v, l }) => (
              <button
                key={l}
                onClick={() => setSmartMode(v)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: smartMode === v ? '#4A8FA3' : 'transparent',
                  color: smartMode === v ? 'white' : '#6b7280',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Stats */}
          <span className="text-xs font-mono" style={{ color: '#4A8FA3' }}>
            {sessionStats.correct}/{sessionStats.total} correct
          </span>
          <span className="text-xs text-gray-500">
            {currentIdx + 1}/{questions.length}
          </span>
        </div>
      </header>

      {/* Filters (Manual mode) */}
      {!smartMode && (
        <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setSection('')}
            className="px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: !section ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
              color: !section ? 'white' : '#9ca3af',
            }}
          >
            All Sections
          </button>
          {ALL_SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(section === s ? '' : s)}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: section === s ? sectionColor[s] : 'rgba(255,255,255,0.06)',
                color: section === s ? 'white' : '#9ca3af',
              }}
            >
              {sectionLabel(s)}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(difficulty === d ? '' : d)}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: difficulty === d ? difficultyColor[d] + '33' : 'rgba(255,255,255,0.06)',
                color: difficulty === d ? difficultyColor[d] : '#9ca3af',
                border: `1px solid ${difficulty === d ? difficultyColor[d] + '66' : 'transparent'}`,
              }}
            >
              {d[0] + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full transition-all"
          style={{
            background: '#4A8FA3',
            width: `${((currentIdx + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 p-5 max-w-3xl mx-auto w-full">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs font-mono text-gray-500">{currentQ.qnum}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: (sectionColor[currentQ.section] ?? '#4A8FA3') + '22',
              color: sectionColor[currentQ.section] ?? '#4A8FA3',
            }}
          >
            {sectionLabel(currentQ.section)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: (difficultyColor[currentQ.difficulty] ?? '#fbbf24') + '22',
              color: difficultyColor[currentQ.difficulty] ?? '#fbbf24',
            }}
          >
            {currentQ.difficulty[0] + currentQ.difficulty.slice(1).toLowerCase()}
          </span>
          {currentQ.textAr && (
            <button
              onClick={() => setShowArabic(!showArabic)}
              className="ml-auto text-xs px-2 py-0.5 rounded-full transition-all"
              style={{
                background: showArabic ? 'rgba(74,143,163,0.2)' : 'rgba(255,255,255,0.06)',
                color: showArabic ? '#7BB3C4' : '#6b7280',
              }}
            >
              {showArabic ? 'EN' : 'عر'}
            </button>
          )}
        </div>

        {/* Question text */}
        <div
          className="text-white text-base leading-relaxed mb-6 p-5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', direction: showArabic ? 'rtl' : 'ltr' }}
        >
          {showArabic && currentQ.textAr ? currentQ.textAr : currentQ.textEn}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => !revealed && setSelected(opt.key)}
              disabled={revealed}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
              style={getOptionStyle(opt.key)}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: revealed && opt.key === currentQ.correctKey
                    ? 'rgba(74,222,128,0.3)'
                    : revealed && opt.key === selected
                    ? 'rgba(248,113,113,0.3)'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                {opt.key.toUpperCase()}
              </span>
              <span className="text-sm">{opt.text}</span>
              {revealed && opt.key === currentQ.correctKey && (
                <span className="ml-auto text-green-400">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Reveal / Next buttons */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={!selected}
            className="btn-primary w-full"
            style={{ opacity: selected ? 1 : 0.4, cursor: selected ? 'pointer' : 'not-allowed' }}
          >
            Reveal Answer
          </button>
        ) : (
          <div className="space-y-4">
            {/* Explanation */}
            <div
              className="p-5 rounded-xl space-y-3"
              style={{ background: 'rgba(74,143,163,0.08)', border: '1px solid rgba(74,143,163,0.2)' }}
            >
              <div className="text-white font-semibold">Explanation</div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {showArabic && currentQ.explanationAr ? currentQ.explanationAr : currentQ.explanationEn}
              </p>
              <div
                className="text-xs p-3 rounded-lg flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span>📖</span>
                <span className="text-gray-400">{currentQ.reference}</span>
              </div>

              {/* Personalized feedback */}
              {selected === currentQ.correctKey ? (
                <div className="text-green-400 text-sm font-medium">✓ Correct! Well done.</div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-red-400 text-sm">Review this concept carefully</div>
                  <Link
                    href={`/guider`}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(74,143,163,0.2)', color: '#7BB3C4' }}
                  >
                    Ask Guider →
                  </Link>
                </div>
              )}
            </div>

            <button onClick={handleNext} className="btn-primary w-full">
              {currentIdx >= questions.length - 1 ? 'View Summary' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
