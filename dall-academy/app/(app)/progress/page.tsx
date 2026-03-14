import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'
import AppShell from '@/components/layout/AppShell'
import { sectionLabel, sectionColor } from '@/lib/utils'
import Link from 'next/link'

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [mem, progress, mocks, totalAnswers] = await Promise.all([
    memoryEngine.getMemory(session.user.id),
    db.userProgress.findMany({ where: { userId: session.user.id } }),
    db.mockAttempt.findMany({
      where: { userId: session.user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'asc' },
    }),
    db.userAnswer.count({ where: { userId: session.user.id } }),
  ])

  const totalCorrect = await db.userAnswer.count({
    where: { userId: session.user.id, isCorrect: true },
  })

  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

  const allSections = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']

  return (
    <AppShell userName={mem.displayName ?? session.user.name ?? undefined}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Your complete SDLE preparation journey</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Questions', value: totalAnswers.toLocaleString(), color: '#4A8FA3' },
            { label: 'Accuracy', value: `${overallAccuracy}%`, color: overallAccuracy >= 60 ? '#4ade80' : '#f87171' },
            { label: 'Est. Score', value: mem.estimatedScore ?? '—', color: (mem.estimatedScore ?? 0) >= 542 ? '#4ade80' : '#fbbf24' },
            { label: 'Day Streak', value: mem.currentStreak, color: '#fbbf24' },
            { label: 'Study Hrs', value: Math.round(mem.totalStudyHours).toString(), color: '#7BB3C4' },
            { label: 'Mock Tests', value: mocks.length, color: '#9AC8D5' },
          ].map((m) => (
            <div key={m.label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Journey */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Score Journey</h2>
            {mocks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-3">No mock tests yet</div>
                <Link href="/mock" className="text-sm px-4 py-2 rounded-lg" style={{ background: '#4A8FA3', color: 'white' }}>
                  Take First Mock
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Passing line indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <div className="w-6 border-t border-dashed border-amber-400" />
                  <span className="text-amber-400">542 passing score</span>
                </div>
                {mocks.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">Mock #{i + 1}</span>
                    <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded transition-all flex items-center px-2"
                        style={{
                          background: (m.score ?? 0) >= 542 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
                          width: `${(((m.score ?? 200) - 200) / 600) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-mono font-bold" style={{ color: (m.score ?? 0) >= 542 ? '#4ade80' : '#f87171' }}>
                          {m.score}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full w-12 text-center"
                      style={{
                        background: (m.score ?? 0) >= 542 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                        color: (m.score ?? 0) >= 542 ? '#4ade80' : '#f87171',
                      }}
                    >
                      {(m.score ?? 0) >= 542 ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Mastery Detail */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Section Mastery</h2>
            <div className="space-y-4">
              {allSections.map((sec) => {
                const p = progress.find((pr) => pr.section === sec)
                const mastery = p?.mastery ?? 0
                const answered = p?.answered ?? 0
                const correct = p?.correct ?? 0
                const color = sectionColor(sec)

                return (
                  <div key={sec}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{sectionLabel(sec)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{correct}/{answered}</span>
                        <span className="text-sm font-bold font-mono" style={{ color: mastery >= 0.8 ? '#4ade80' : mastery >= 0.6 ? '#fbbf24' : '#f87171' }}>
                          {Math.round(mastery * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          background: color,
                          width: `${mastery * 100}%`,
                          opacity: answered === 0 ? 0.3 : 1,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600">{answered} answered</span>
                      <Link
                        href={`/qbank?section=${sec}`}
                        className="text-xs transition-colors"
                        style={{ color: '#4A8FA3' }}
                      >
                        Practice →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Confused Topics */}
        {mem.confusedTopics.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Topics to Review</h2>
            <p className="text-gray-500 text-sm mb-4">Topics you&apos;ve asked about multiple times</p>
            <div className="flex flex-wrap gap-3">
              {mem.confusedTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/guider`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: '#fca5a5',
                  }}
                >
                  <span>⚠️</span>
                  {topic}
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,113,113,0.2)' }}>
                    Review
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mock History Table */}
        {mocks.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Mock History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left pb-3">Date</th>
                    <th className="text-left pb-3">Score</th>
                    <th className="text-left pb-3">Result</th>
                    <th className="text-left pb-3">Time</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {mocks.map((m, i) => (
                    <tr key={m.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="py-3 text-gray-400">
                        {m.completedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 font-bold font-mono" style={{ color: (m.score ?? 0) >= 542 ? '#4ade80' : '#f87171' }}>
                        {m.score ?? '—'}
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: (m.score ?? 0) >= 542 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                            color: (m.score ?? 0) >= 542 ? '#4ade80' : '#f87171',
                          }}
                        >
                          {(m.score ?? 0) >= 542 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 font-mono text-xs">
                        {m.timeTaken ? `${Math.floor(m.timeTaken / 60)}m` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
