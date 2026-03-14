import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default async function AdminRevenuePage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const [transactions, userCount] = await Promise.all([
    db.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.user.count(),
  ])

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthRev = transactions
    .filter((t) => t.createdAt >= thisMonthStart)
    .reduce((s, t) => s + t.amount, 0)
  const lastMonthRev = transactions
    .filter((t) => t.createdAt >= lastMonthStart && t.createdAt < thisMonthStart)
    .reduce((s, t) => s + t.amount, 0)

  const revChange = lastMonthRev > 0
    ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
    : null

  const planPrices: Record<string, number> = { BASIC: 99, ANNUAL: 299, LIFE: 499 }
  const mrr = transactions
    .filter((t) => ['BASIC', 'ANNUAL'].includes(t.plan))
    .reduce((s, t) => s + (planPrices[t.plan] ?? 0) / (t.plan === 'ANNUAL' ? 12 : 1), 0)

  const statusColors: Record<string, string> = {
    COMPLETED: '#4ade80',
    PENDING: '#fbbf24',
    FAILED: '#f87171',
    REFUNDED: '#a78bfa',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Revenue</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} SAR`, color: '#4ade80' },
            { label: 'This Month', value: `${thisMonthRev.toLocaleString()} SAR`, color: '#4A8FA3', sub: revChange !== null ? `${revChange > 0 ? '+' : ''}${revChange}% vs last month` : undefined },
            { label: 'MRR (est.)', value: `${Math.round(mrr).toLocaleString()} SAR`, color: '#7BB3C4' },
            { label: 'Transactions', value: transactions.length, color: '#9AC8D5' },
          ].map((k) => (
            <div key={k.label} className="glass-card p-4">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
              {k.sub && (
                <div className="text-xs mt-1" style={{ color: revChange && revChange > 0 ? '#4ade80' : '#f87171' }}>
                  {k.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-white mb-4">Recent Transactions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left pb-3">User</th>
                <th className="text-left pb-3">Plan</th>
                <th className="text-left pb-3">Amount</th>
                <th className="text-left pb-3">Date</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-3">
                    <div className="text-white text-sm">{t.user.name ?? t.user.email}</div>
                    <div className="text-gray-500 text-xs">{t.user.email}</div>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-gray-400">{t.plan}</span>
                  </td>
                  <td className="py-3 font-mono font-bold" style={{ color: '#4ade80' }}>
                    {t.amount.toLocaleString()} SAR
                  </td>
                  <td className="py-3 text-gray-500 text-xs">
                    {t.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: (statusColors[t.status] ?? '#6b7280') + '22', color: statusColors[t.status] ?? '#6b7280' }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
