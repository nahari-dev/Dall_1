import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { formatRelativeTime } from '@/lib/utils'

interface PageProps {
  searchParams: { page?: string; search?: string; plan?: string }
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const page = parseInt(searchParams.page ?? '1', 10)
  const search = searchParams.search ?? ''
  const planFilter = searchParams.plan ?? ''
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (planFilter) where.plan = planFilter

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        memory: { select: { estimatedScore: true, currentStreak: true, questionsToday: true } },
        _count: { select: { answers: true, mockAttempts: true } },
      },
    }),
    db.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)
  const planColors: Record<string, string> = { FREE: '#6b7280', BASIC: '#4A8FA3', ANNUAL: '#7BB3C4', LIFE: '#fbbf24' }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} total users</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <form className="flex gap-2 flex-1 min-w-48">
            <input
              name="search"
              defaultValue={search}
              className="input-dark flex-1"
              placeholder="Search by name or email…"
            />
            <button type="submit" className="btn-primary px-4">Search</button>
          </form>
          <div className="flex gap-2">
            {['', 'FREE', 'BASIC', 'ANNUAL', 'LIFE'].map((p) => (
              <a
                key={p}
                href={`?plan=${p}&search=${search}`}
                className="px-3 py-2 rounded-lg text-xs transition-all"
                style={{
                  background: planFilter === p ? '#4A8FA3' : 'rgba(255,255,255,0.06)',
                  color: planFilter === p ? 'white' : '#9ca3af',
                }}
              >
                {p || 'All'}
              </a>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Plan</th>
                <th className="text-left p-4">Score</th>
                <th className="text-left p-4">Streak</th>
                <th className="text-left p-4">Questions</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-white/5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: '#4A8FA3' }}
                      >
                        {u.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <div className="text-white">{u.name ?? '—'}</div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: (planColors[u.plan] ?? '#6b7280') + '22', color: planColors[u.plan] ?? '#6b7280' }}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <span style={{ color: (u.memory?.estimatedScore ?? 0) >= 542 ? '#4ade80' : '#9ca3af' }}>
                      {u.memory?.estimatedScore ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {u.memory?.currentStreak ? `🔥 ${u.memory.currentStreak}d` : '—'}
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{u._count.answers}</td>
                  <td className="p-4 text-gray-500 text-xs">{formatRelativeTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}&search=${search}&plan=${planFilter}`} className="btn-ghost px-4 py-2 text-sm">
                  ← Prev
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}&search=${search}&plan=${planFilter}`} className="btn-primary px-4 py-2 text-sm">
                  Next →
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
