import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers,
    newUsers,
    trialUsers,
    totalQuestions,
    allMocks,
    recentSignups,
    usersByPlan,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { updatedAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { trialEndsAt: { gte: new Date() }, plan: 'FREE' } }),
    db.question.count(),
    db.mockAttempt.findMany({ where: { status: 'COMPLETED' }, select: { score: true } }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    }),
    db.user.groupBy({ by: ['plan'], _count: { plan: true } }),
  ])

  const avgMockScore =
    allMocks.length > 0
      ? Math.round(allMocks.reduce((s, m) => s + (m.score ?? 0), 0) / allMocks.length)
      : null
  const passRate =
    allMocks.length > 0
      ? Math.round((allMocks.filter((m) => (m.score ?? 0) >= 542).length / allMocks.length) * 100)
      : null

  const planColors: Record<string, string> = {
    FREE: '#6b7280',
    BASIC: '#4A8FA3',
    ANNUAL: '#7BB3C4',
    LIFE: '#fbbf24',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <p className="text-gray-500 text-sm">Platform health at a glance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: totalUsers.toLocaleString(), icon: '👥', color: '#4A8FA3' },
            { label: 'Active (7d)', value: activeUsers.toLocaleString(), icon: '⚡', color: '#4ade80' },
            { label: 'New (7d)', value: newUsers.toLocaleString(), icon: '✨', color: '#7BB3C4' },
            { label: 'Trial Users', value: trialUsers.toLocaleString(), icon: '⏳', color: '#fbbf24' },
            { label: 'Questions', value: totalQuestions.toLocaleString(), icon: '📝', color: '#9AC8D5' },
            { label: 'Avg Mock Score', value: avgMockScore?.toString() ?? '—', icon: '🎯', color: avgMockScore && avgMockScore >= 542 ? '#4ade80' : '#f87171' },
            { label: 'Pass Rate', value: passRate !== null ? `${passRate}%` : '—', icon: '✓', color: passRate && passRate >= 50 ? '#4ade80' : '#f87171' },
            { label: 'Mock Attempts', value: allMocks.length.toLocaleString(), icon: '📊', color: '#7BB3C4' },
          ].map((k) => (
            <div key={k.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{k.icon}</span>
                <span className="text-xs text-gray-500">{k.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Plan */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Users by Plan</h2>
            <div className="space-y-3">
              {usersByPlan.map((p) => (
                <div key={p.plan} className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium w-16 text-center"
                    style={{ background: (planColors[p.plan] ?? '#6b7280') + '33', color: planColors[p.plan] ?? '#6b7280' }}
                  >
                    {p.plan}
                  </span>
                  <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded"
                      style={{
                        background: planColors[p.plan] ?? '#6b7280',
                        width: `${(p._count.plan / totalUsers) * 100}%`,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-400 w-12 text-right">{p._count.plan}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Recent Signups</h2>
              <Link href="/admin/users" className="text-xs" style={{ color: '#4A8FA3' }}>View all →</Link>
            </div>
            <div className="space-y-3">
              {recentSignups.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#4A8FA3' }}
                  >
                    {u.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{u.name ?? 'Unknown'}</div>
                    <div className="text-gray-500 text-xs truncate">{u.email}</div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: (planColors[u.plan] ?? '#6b7280') + '22', color: planColors[u.plan] ?? '#6b7280' }}
                  >
                    {u.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {avgMockScore !== null && avgMockScore < 500 && (
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="text-yellow-400">⚠️</span>
            <span className="text-sm text-yellow-300">Platform average score is {avgMockScore} — below 500. Consider reviewing question difficulty.</span>
          </div>
        )}
      </main>
    </div>
  )
}
