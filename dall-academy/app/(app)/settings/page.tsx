'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Memory {
  displayName: string
  preferredLang: string
  examGoalDate: string
  targetSpecialty: string
  university: string
  graduationYear: number | null
  learningStyle: string
  dailyGoal: number
  reminderTime: string
  enableReminder: boolean
  showArabicFirst: boolean
  weakSections: string[]
  strongSections: string[]
  confusedTopics: string[]
  masteredTopics: string[]
  estimatedScore: number | null
}

const tabs = ['Profile', 'Study Preferences', 'Notifications', 'My Data']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [mem, setMem] = useState<Memory | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/memory').then((r) => r.json()).then(setMem)
  }, [])

  async function save() {
    if (!mem) return
    setSaving(true)
    try {
      await fetch('/api/memory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mem),
      })
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!mem) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--dark-bg)' }}>
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <header
        className="flex items-center gap-4 px-5 py-3"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-white font-semibold">Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === i ? '#4A8FA3' : 'transparent',
                color: activeTab === i ? 'white' : '#9ca3af',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Profile */}
          {activeTab === 0 && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                <input className="input-dark" value={mem.displayName ?? ''} onChange={(e) => setMem({ ...mem, displayName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">University</label>
                <input className="input-dark" value={mem.university ?? ''} onChange={(e) => setMem({ ...mem, university: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Specialty</label>
                <select className="input-dark" value={mem.targetSpecialty ?? ''} onChange={(e) => setMem({ ...mem, targetSpecialty: e.target.value })}>
                  <option value="">Select specialty</option>
                  {['General Dentistry', 'Orthodontics', 'Periodontics', 'Endodontics', 'Oral Surgery', 'Prosthodontics', 'Pediatric Dentistry'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exam Goal Date</label>
                <input
                  type="date"
                  className="input-dark"
                  value={mem.examGoalDate ? new Date(mem.examGoalDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setMem({ ...mem, examGoalDate: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Study Preferences */}
          {activeTab === 1 && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Daily Goal: {mem.dailyGoal} questions</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={mem.dailyGoal}
                  onChange={(e) => setMem({ ...mem, dailyGoal: parseInt(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: '#4A8FA3' }}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>10</span><span>50</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred Language</label>
                <div className="flex gap-2">
                  {[{ v: 'en', l: 'English' }, { v: 'ar', l: 'العربية' }, { v: 'bilingual', l: 'Both' }].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setMem({ ...mem, preferredLang: o.v })}
                      className="flex-1 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: mem.preferredLang === o.v ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
                        color: mem.preferredLang === o.v ? 'white' : '#9ca3af',
                      }}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Learning Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['conceptual', 'clinical', 'mnemonics', 'practice'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setMem({ ...mem, learningStyle: s })}
                      className="py-2.5 rounded-lg text-sm transition-all capitalize"
                      style={{
                        background: mem.learningStyle === s ? 'rgba(74,143,163,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${mem.learningStyle === s ? '#4A8FA3' : 'rgba(255,255,255,0.08)'}`,
                        color: mem.learningStyle === s ? 'white' : '#9ca3af',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Show Arabic first</span>
                <button
                  onClick={() => setMem({ ...mem, showArabicFirst: !mem.showArabicFirst })}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: mem.showArabicFirst ? '#4A8FA3' : 'rgba(255,255,255,0.15)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: mem.showArabicFirst ? '26px' : '2px' }}
                  />
                </button>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeTab === 2 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">Daily Study Reminder</div>
                  <div className="text-xs text-gray-500">Get reminded to study each day</div>
                </div>
                <button
                  onClick={() => setMem({ ...mem, enableReminder: !mem.enableReminder })}
                  className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: mem.enableReminder ? '#4A8FA3' : 'rgba(255,255,255,0.15)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: mem.enableReminder ? '26px' : '2px' }}
                  />
                </button>
              </div>
              {mem.enableReminder && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reminder Time</label>
                  <input
                    type="time"
                    className="input-dark"
                    value={mem.reminderTime ?? '20:00'}
                    onChange={(e) => setMem({ ...mem, reminderTime: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          {/* My Data */}
          {activeTab === 3 && (
            <>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs text-gray-500 mb-1">Estimated Score</div>
                  <div className="font-mono font-bold text-white">{mem.estimatedScore ?? '—'} / 800</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs text-gray-500 mb-2">Weak Sections</div>
                  <div className="flex flex-wrap gap-1">
                    {mem.weakSections.length > 0
                      ? mem.weakSections.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>{s}</span>
                        ))
                      : <span className="text-xs text-gray-600">None identified yet</span>}
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs text-gray-500 mb-2">Confused Topics</div>
                  <div className="flex flex-wrap gap-1">
                    {mem.confusedTopics.length > 0
                      ? mem.confusedTopics.map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>{t}</span>
                        ))
                      : <span className="text-xs text-gray-600">None yet</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const json = JSON.stringify(mem, null, 2)
                  const blob = new Blob([json], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'dall-academy-data.json'
                  a.click()
                }}
                className="btn-ghost w-full"
              >
                Download My Data (JSON)
              </button>
              <button
                onClick={async () => {
                  if (!confirm('Reset all learning data? Your account will be kept but progress reset.')) return
                  await fetch('/api/memory', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      weakSections: [],
                      strongSections: [],
                      confusedTopics: [],
                      masteredTopics: [],
                      estimatedScore: null,
                      currentStreak: 0,
                      questionsToday: 0,
                      consecutiveFails: 0,
                      totalStudyHours: 0,
                    }),
                  })
                  toast.success('Learning data reset')
                }}
                className="w-full py-3 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                Reset Learning Data
              </button>
            </>
          )}

          {activeTab !== 3 && (
            <button onClick={save} className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
