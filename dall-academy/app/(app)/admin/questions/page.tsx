'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import toast from 'react-hot-toast'
import { sectionLabel } from '@/lib/utils'

interface Question {
  id: string
  qnum: string
  section: string
  difficulty: string
  textEn: string
  options: Record<string, string>
  correctKey: string
  explanationEn: string
  reference: string
  usageCount: number
  correctCount: number
}

const SECTIONS = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']
const DIFFICULTIES = ['EASY', 'INTERMEDIATE', 'ADVANCED']

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [section, setSection] = useState('')
  const [editQ, setEditQ] = useState<Question | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    qnum: '', section: 'PERIODONTICS', difficulty: 'INTERMEDIATE',
    textEn: '', textAr: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correctKey: 'a', explanationEn: '', explanationAr: '', reference: '', tags: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (section) params.set('section', section)
      const res = await fetch(`/api/questions?${params}`)
      const data = await res.json()
      setQuestions(data.questions ?? [])
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => { load() }, [load])

  const filtered = questions.filter((q) =>
    !search || q.textEn.toLowerCase().includes(search.toLowerCase()) || q.qnum.includes(search)
  )

  async function saveQuestion() {
    try {
      const method = editQ ? 'PUT' : 'POST'
      const body = {
        ...(editQ && { id: editQ.id }),
        qnum: form.qnum,
        section: form.section,
        difficulty: form.difficulty,
        textEn: form.textEn,
        textAr: form.textAr || undefined,
        options: { a: form.optionA, b: form.optionB, c: form.optionC, d: form.optionD },
        correctKey: form.correctKey,
        explanationEn: form.explanationEn,
        explanationAr: form.explanationAr || undefined,
        reference: form.reference,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }

      const res = await fetch('/api/admin/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed')
      toast.success(editQ ? 'Question updated' : 'Question created')
      setShowForm(false)
      setEditQ(null)
      load()
    } catch {
      toast.error('Failed to save question')
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Questions</h1>
            <p className="text-gray-500 text-sm">{questions.length} questions loaded</p>
          </div>
          <button onClick={() => { setEditQ(null); setShowForm(true) }} className="btn-primary">
            + Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <input
            className="input-dark flex-1 min-w-48"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSection('')} className="px-3 py-2 rounded-lg text-xs" style={{ background: !section ? '#4A8FA3' : 'rgba(255,255,255,0.06)', color: !section ? 'white' : '#9ca3af' }}>
              All
            </button>
            {SECTIONS.map((s) => (
              <button key={s} onClick={() => setSection(section === s ? '' : s)} className="px-3 py-2 rounded-lg text-xs transition-all" style={{ background: section === s ? '#4A8FA3' : 'rgba(255,255,255,0.06)', color: section === s ? 'white' : '#9ca3af' }}>
                {sectionLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading…</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left p-4">Q#</th>
                  <th className="text-left p-4">Section</th>
                  <th className="text-left p-4">Difficulty</th>
                  <th className="text-left p-4">Question</th>
                  <th className="text-left p-4">Usage</th>
                  <th className="text-left p-4">Correct %</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const rate = q.usageCount > 0 ? Math.round((q.correctCount / q.usageCount) * 100) : null
                  return (
                    <tr key={q.id} className="hover:bg-white/5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="p-4 font-mono text-xs text-gray-400">{q.qnum}</td>
                      <td className="p-4">
                        <span className="text-xs" style={{ color: '#4A8FA3' }}>{sectionLabel(q.section)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-gray-400">{q.difficulty}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate text-gray-300 text-xs">{q.textEn}</div>
                      </td>
                      <td className="p-4 font-mono text-gray-400">{q.usageCount}</td>
                      <td className="p-4 font-mono">
                        <span style={{ color: rate !== null ? (rate >= 60 ? '#4ade80' : '#f87171') : '#6b7280' }}>
                          {rate !== null ? `${rate}%` : '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setEditQ(q)
                            setForm({
                              qnum: q.qnum, section: q.section, difficulty: q.difficulty,
                              textEn: q.textEn, textAr: '', optionA: q.options.a ?? '', optionB: q.options.b ?? '',
                              optionC: q.options.c ?? '', optionD: q.options.d ?? '',
                              correctKey: q.correctKey, explanationEn: q.explanationEn,
                              explanationAr: '', reference: q.reference, tags: '',
                            })
                            setShowForm(true)
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(74,143,163,0.2)', color: '#7BB3C4' }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="glass-card p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editQ ? 'Edit Question' : 'New Question'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Q Number</label>
                    <input className="input-dark text-sm" value={form.qnum} onChange={(e) => setForm({ ...form, qnum: e.target.value })} placeholder="Q-0001" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Section</label>
                    <select className="input-dark text-sm" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                      {SECTIONS.map((s) => <option key={s} value={s}>{sectionLabel(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                    <select className="input-dark text-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Question Text (EN)</label>
                  <textarea className="input-dark text-sm" rows={3} value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((k) => {
                    const key = `option${k}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
                    return (
                      <div key={k}>
                        <label className="block text-xs text-gray-400 mb-1">Option {k}</label>
                        <input className="input-dark text-sm" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                      </div>
                    )
                  })}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Correct Answer</label>
                  <select className="input-dark text-sm" value={form.correctKey} onChange={(e) => setForm({ ...form, correctKey: e.target.value })}>
                    {['a', 'b', 'c', 'd'].map((k) => <option key={k} value={k}>Option {k.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Explanation (EN)</label>
                  <textarea className="input-dark text-sm" rows={3} value={form.explanationEn} onChange={(e) => setForm({ ...form, explanationEn: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Reference</label>
                  <input className="input-dark text-sm" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Carranza's Clinical Periodontology, Chapter 5, p. 82" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveQuestion} className="btn-primary flex-1">
                    {editQ ? 'Update Question' : 'Create Question'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
