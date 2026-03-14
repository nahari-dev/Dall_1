'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { daysBetween } from '@/lib/utils'

const sections = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']
const sectionLabels: Record<string, string> = {
  PERIODONTICS: 'Periodontics',
  ENDODONTICS: 'Endodontics',
  RESTORATIVE: 'Restorative Dentistry',
  ORTHO_PEDO: 'Ortho & Pediatric Dentistry',
  ORAL_MEDICINE: 'Oral Medicine & Surgery',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    displayName: '',
    preferredLang: 'en' as 'en' | 'ar' | 'bilingual',
    examGoalDate: '',
    targetSpecialty: '',
    learningStyle: '',
    prefersShortSess: false,
    sectionRatings: {} as Record<string, number>,
    dailyGoal: 20,
    reminderTime: '20:00',
  })

  function nextStep() { setStep((s) => s + 1) }
  function prevStep() { setStep((s) => s - 1) }

  async function finish() {
    setLoading(true)
    try {
      const weakSections = sections.filter((s) => (data.sectionRatings[s] ?? 3) <= 2)
      const strongSections = sections.filter((s) => (data.sectionRatings[s] ?? 3) >= 4)

      await fetch('/api/memory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          preferredLang: data.preferredLang,
          examGoalDate: data.examGoalDate ? new Date(data.examGoalDate).toISOString() : null,
          targetSpecialty: data.targetSpecialty,
          learningStyle: data.learningStyle,
          prefersShortSess: data.prefersShortSess,
          weakSections,
          strongSections,
          dailyGoal: data.dailyGoal,
          reminderTime: data.reminderTime,
          onboardingDone: true,
        }),
      })

      const daysLeft = data.examGoalDate
        ? daysBetween(new Date(), new Date(data.examGoalDate))
        : null

      toast.success(
        `Welcome, ${data.displayName || 'Student'}! ${daysLeft ? `${daysLeft} days to your SDLE.` : ''} Let's get started!`,
        { duration: 4000 }
      )

      router.push('/dashboard')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step - 1) / 5) * 100

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--dark-bg)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#4A8FA3' }}>
              <span className="text-white font-bold text-sm font-display">D</span>
            </div>
            <span className="text-xl font-bold text-white font-display">Dall Academy</span>
          </div>
          <div className="text-gray-400 text-sm">Step {step} of 5 — Personalize your experience</div>
          {/* Progress bar */}
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all" style={{ background: '#4A8FA3', width: `${progress}%` }} />
          </div>
        </div>

        <div className="glass-card p-8">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Let&apos;s get acquainted 👋</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">What should we call you?</label>
                <input
                  className="input-dark"
                  placeholder="Dr. Ahmed"
                  value={data.displayName}
                  onChange={(e) => setData({ ...data, displayName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Preferred language?</label>
                <div className="flex gap-3">
                  {[
                    { v: 'en', l: 'English' },
                    { v: 'ar', l: 'العربية' },
                    { v: 'bilingual', l: 'Both' },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setData({ ...data, preferredLang: opt.v as 'en' | 'ar' | 'bilingual' })}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: data.preferredLang === opt.v ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
                        color: data.preferredLang === opt.v ? 'white' : '#9ca3af',
                        border: `1px solid ${data.preferredLang === opt.v ? '#4A8FA3' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Exam Goal */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white">When&apos;s your SDLE? 📅</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exam Date (optional)</label>
                <input
                  type="date"
                  className="input-dark"
                  value={data.examGoalDate}
                  onChange={(e) => setData({ ...data, examGoalDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Specialty</label>
                <select
                  className="input-dark"
                  value={data.targetSpecialty}
                  onChange={(e) => setData({ ...data, targetSpecialty: e.target.value })}
                >
                  <option value="">Select specialty</option>
                  {['General Dentistry', 'Orthodontics', 'Periodontics', 'Endodontics', 'Oral Surgery', 'Prosthodontics', 'Pediatric Dentistry'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Learning Style */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white">How do you learn best? 🎓</h2>
              {[
                { icon: '🏃', title: 'Quick daily sessions (15–20 min)', style: 'practice', short: true },
                { icon: '📖', title: 'Deep study sessions (1–2 hours)', style: 'conceptual', short: false },
                { icon: '🏥', title: 'Clinical cases & scenarios', style: 'clinical', short: false },
                { icon: '🧠', title: 'Mnemonics & shortcuts', style: 'mnemonics', short: false },
              ].map((opt) => (
                <button
                  key={opt.style}
                  onClick={() => setData({ ...data, learningStyle: opt.style, prefersShortSess: opt.short })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: data.learningStyle === opt.style ? 'rgba(74,143,163,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${data.learningStyle === opt.style ? '#4A8FA3' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className={`text-sm ${data.learningStyle === opt.style ? 'text-white' : 'text-gray-400'}`}>
                    {opt.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Self Assessment */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Rate your confidence 💪</h2>
              <p className="text-gray-500 text-sm">Rate each section 1 (weak) to 5 (strong)</p>
              {sections.map((sec) => (
                <div key={sec}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{sectionLabels[sec]}</span>
                    <span className="text-sm font-mono" style={{ color: '#4A8FA3' }}>
                      {data.sectionRatings[sec] ?? 3}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={data.sectionRatings[sec] ?? 3}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sectionRatings: { ...data.sectionRatings, [sec]: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-teal-500"
                    style={{ accentColor: '#4A8FA3' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Daily Goal */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Set your daily goal 🎯</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Questions per day</label>
                <div className="flex gap-2">
                  {[10, 20, 30, 50].map((n) => (
                    <button
                      key={n}
                      onClick={() => setData({ ...data, dailyGoal: n })}
                      className="flex-1 py-3 rounded-lg font-bold font-mono transition-all"
                      style={{
                        background: data.dailyGoal === n ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
                        color: data.dailyGoal === n ? 'white' : '#9ca3af',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Study reminder time</label>
                <input
                  type="time"
                  className="input-dark"
                  value={data.reminderTime}
                  onChange={(e) => setData({ ...data, reminderTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={prevStep} className="btn-ghost flex-1">
                ← Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={nextStep} className="btn-primary flex-1">
                Continue →
              </button>
            ) : (
              <button onClick={finish} className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Setting up…' : "Let's Go! 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
