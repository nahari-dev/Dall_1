import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { sectionLabel } from '@/lib/utils'

export default async function AdminAnalyticsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const [allMocks, allAnswers, hardestQ, sectionProgress] = await Promise.all([
    db.mockAttempt.findMany({ where: { status: 'COMPLETED' }, select: { score: true } }),
    db.userAnswer.count(),
    db.question.findMany({
      where: { usageCount: { gt: 5 } },
      orderBy: [{ usageCount: 'desc' }],
      take: 10,
      select: { id: true, qnum: true, section: true, textEn: true, usageCount: true, correctCount: true },
    }),
    db.userProgress.groupBy({
      by: ['section'],
      _avg: { mastery: true },
      _count: { section: true },
    }),
  ])

  const avgScore = allMocks.length > 0
    ? Math.round(allMocks.reduce((s, m) => s + (m.score ?? 0), 0) / allMocks.length)
    : 0
  const passRate = allMocks.length > 0
    ? Math.round((allMocks.filter((m) => (m.score ?? 0) >= 542).length / allMocks.length) * 100)
    : 0

  // Score distribution buckets
  const buckets: Record<string, number> = {}
  for (let i = 200; i < 800; i += 50) {
    buckets[`${i}-${i + 49}`] = 0
  }
  allMocks.forEach((m) => {
    const s = m.score ?? 200
    const bucket = Math.floor((s - 200) / 50) * 50 + 200
    const key = `${bucket}-${bucket + 49}`
    if (key in buckets) buckets[key]++
  })

  const hardestSorted = hardestQ
    .map((q) => ({
      ...q,
      correctRate: q.usageCount > 0 ? Math.round((q.correctCount / q.usageCount) * 100) : null,
    }))
    .sort((a, b) => (a.correctRate ?? 100) - (b.correctRate ?? 100))

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Answers', value: allAnswers.toLocaleString(), color: '#4A8FA3' },
            { label: 'Mock Attempts', value: allMocks.length, color: '#7BB3C4' },
            { label: 'Avg Mock Score', value: avgScore || '—', color: avgScore >= 542 ? '#4ade80' : '#f87171' },
            { label: 'Pass Rate', value: `${passRate}%`, color: passRate >= 50 ? '#4ade80' : '#f87171' },
          ].map((m) => (
            <div key={m.label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Score Distribution</h2>
            <div className="space-y-2">
              {Object.entries(buckets).map(([range, count]) => {
                const [start] = range.split('-').map(Number)
                const maxCount = Math.max(...Object.values(buckets), 1)
                const isPass = start >= 542
                return (
                  <div key={range} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 w-20">{range}</span>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          background: isPass ? 'rgba(74,222,128,0.5)' : 'rgba(74,143,163,0.5)',
                          width: `${(count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400 w-6">{count}</span>
                  </div>
                )
              })}
              <div className="text-xs text-gray-600 mt-2">
                Green = passing (≥542) · Blue = failing
              </div>
            </div>
          </div>

          {/* Section Mastery Platform-wide */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Section Performance (Platform)</h2>
            <div className="space-y-4">
              {sectionProgress.map((sp) => {
                const avg = (sp._avg.mastery ?? 0) * 100
                return (
                  <div key={sp.section}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{sectionLabel(sp.section)}</span>
                      <span className="text-sm font-mono" style={{ color: avg >= 60 ? '#4ade80' : '#f87171' }}>
                        {Math.round(avg)}% avg
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: avg >= 60 ? '#4ade80' : '#4A8FA3',
                          width: `${avg}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{sp._count.section} students</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hardest Questions */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-white mb-4">Hardest Questions (Lowest Correct Rate)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left pb-3">Q#</th>
                <th className="text-left pb-3">Section</th>
                <th className="text-left pb-3">Question</th>
                <th className="text-left pb-3">Attempts</th>
                <th className="text-left pb-3">Correct Rate</th>
              </tr>
            </thead>
            <tbody>
              {hardestSorted.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-3 font-mono text-xs text-gray-500">{q.qnum}</td>
                  <td className="py-3 text-xs" style={{ color: '#4A8FA3' }}>{sectionLabel(q.section)}</td>
                  <td className="py-3 max-w-xs truncate text-gray-300 text-xs">{q.textEn}</td>
                  <td className="py-3 font-mono text-gray-400">{q.usageCount}</td>
                  <td className="py-3 font-mono">
                    <span style={{ color: (q.correctRate ?? 0) < 40 ? '#f87171' : '#fbbf24' }}>
                      {q.correctRate !== null ? `${q.correctRate}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
