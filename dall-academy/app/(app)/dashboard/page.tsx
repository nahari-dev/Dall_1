import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'
import AppShell from '@/components/layout/AppShell'
import {
  getGreeting,
  sectionLabel,
  scoreToColor,
  masteryBadge,
  daysBetween,
} from '@/lib/utils'
import Link from 'next/link'
import Gauge from '@/components/ui/Gauge'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [mem, progress, mocks] = await Promise.all([
    memoryEngine.getMemory(session.user.id),
    db.userProgress.findMany({ where: { userId: session.user.id } }),
    db.mockAttempt.findMany({
      where: { userId: session.user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ])

  if (!mem.onboardingDone) redirect('/onboarding')

  const ctx = memoryEngine.buildPersonalizationContext(mem)
  const greeting = getGreeting()

  const greetingText = {
    high: `${greeting}, ${ctx.name ?? 'Student'}! You're on fire 🔥`,
    normal: `${greeting}, ${ctx.name ?? 'Student'}. Ready to study?`,
    low: `${greeting}, ${ctx.name ?? 'Student'}. Every question counts 📚`,
    'at-risk': `${greeting}, ${ctx.name ?? 'Student'}. Let's turn this around 💪`,
  }[mem.motivationLevel] ?? `${greeting}, ${ctx.name ?? 'Student'}.`

  const allSections = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']

  // Build recommendations
  const recommendations: { icon: string; title: string; desc: string; href: string }[] = []
  if (ctx.weakSections[0] && (progress.find((p) => p.section === ctx.weakSections[0])?.mastery ?? 0) < 0.5) {
    recommendations.push({
      icon: '🎯',
      title: `Weak Area: ${sectionLabel(ctx.weakSections[0])}`,
      desc: 'Practice 10 focused questions',
      href: `/qbank?section=${ctx.weakSections[0]}`,
    })
  }
  if (ctx.confusedTopics.length > 0) {
    recommendations.push({
      icon: '🧠',
      title: `Review: "${ctx.confusedTopics[0]}"`,
      desc: `You asked about this ${Math.min(mem.lastTopicsAsked.filter((t) => t === ctx.confusedTopics[0]).length, 9)}+ times`,
      href: '/guider',
    })
  }
  if (ctx.daysUntilExam && ctx.daysUntilExam < 14) {
    recommendations.push({
      icon: '⚡',
      title: `Exam in ${ctx.daysUntilExam} days!`,
      desc: 'Take a full mock test today',
      href: '/mock',
    })
  }
  if (ctx.consecutiveFails >= 2) {
    recommendations.push({
      icon: '💪',
      title: 'Build Confidence First',
      desc: 'Try easier questions to regain momentum',
      href: '/qbank?difficulty=EASY',
    })
  }

  const scoreColor = ctx.estimatedScore
    ? ctx.estimatedScore >= 542 ? '#4ade80' : ctx.estimatedScore >= 480 ? '#fbbf24' : '#f87171'
    : '#4A8FA3'

  return (
    <AppShell userName={mem.displayName ?? session.user.name ?? undefined}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Greeting Card */}
        <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{greetingText}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {mem.currentStreak >= 3 && (
                <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                  🔥 {mem.currentStreak} day streak
                </span>
              )}
              {ctx.daysUntilExam !== null && (
                <span className="text-sm" style={{ color: ctx.daysUntilExam < 30 ? '#f87171' : '#7BB3C4' }}>
                  {ctx.daysUntilExam} days to SDLE
                </span>
              )}
            </div>
          </div>
          <Link href="/qbank" className="btn-primary text-sm">
            Start Studying →
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Score Estimate */}
          <div className="glass-card p-5 text-center">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Est. Score</div>
            {ctx.estimatedScore ? (
              <>
                <Gauge value={ctx.estimatedScore} color={scoreColor} size={100} />
                <div className="text-2xl font-bold font-mono mt-1" style={{ color: scoreColor }}>
                  {ctx.estimatedScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {ctx.estimatedScore >= 542
                    ? `+${ctx.estimatedScore - 542} above passing`
                    : `${542 - ctx.estimatedScore} below passing`}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm py-4">No data yet</div>
            )}
          </div>

          {/* Daily Goal */}
          <div className="glass-card p-5 text-center">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Today</div>
            <div className="text-3xl font-bold font-mono text-white">
              {mem.questionsToday}/{mem.dailyGoal}
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  background: '#4A8FA3',
                  width: `${Math.min(100, (mem.questionsToday / mem.dailyGoal) * 100)}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {mem.questionsToday >= mem.dailyGoal
                ? 'Goal crushed! 🎯'
                : `${mem.dailyGoal - mem.questionsToday} more to go`}
            </div>
          </div>

          {/* Weakest Section */}
          <div className="glass-card p-5">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Focus Area</div>
            {ctx.weakSections[0] ? (
              <>
                <div className="font-bold text-white text-sm mb-1">{sectionLabel(ctx.weakSections[0])}</div>
                <div className="text-xs text-red-400 mb-3">
                  {Math.round((progress.find((p) => p.section === ctx.weakSections[0])?.mastery ?? 0) * 100)}% mastery
                </div>
                <Link
                  href={`/qbank?section=${ctx.weakSections[0]}`}
                  className="text-xs px-3 py-1.5 rounded-lg block text-center"
                  style={{ background: 'rgba(74,143,163,0.2)', color: '#7BB3C4' }}
                >
                  Practice Now →
                </Link>
              </>
            ) : (
              <div className="text-gray-500 text-sm">All sections good 👍</div>
            )}
          </div>

          {/* Exam Countdown */}
          <div className="glass-card p-5 text-center">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Exam Countdown</div>
            {ctx.daysUntilExam !== null ? (
              <>
                <div
                  className="text-4xl font-bold font-mono font-display"
                  style={{
                    color:
                      ctx.daysUntilExam > 60 ? '#4ade80'
                        : ctx.daysUntilExam > 30 ? '#fbbf24'
                        : '#f87171',
                  }}
                >
                  {ctx.daysUntilExam}
                </div>
                <div className="text-gray-400 text-xs mt-1">days remaining</div>
                <div className="text-xs mt-2 text-gray-600">
                  {ctx.urgencyLevel === 'critical' && '⚠️ Final stretch!'}
                  {ctx.urgencyLevel === 'high' && 'Focus intensely'}
                  {ctx.urgencyLevel === 'medium' && 'Steady progress'}
                  {ctx.urgencyLevel === 'low' && 'Build strong habits'}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm">Set exam date in settings</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Mastery */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4">Section Mastery</h2>
            <div className="space-y-3">
              {allSections.map((sec) => {
                const p = progress.find((pr) => pr.section === sec)
                const mastery = p?.mastery ?? 0
                const badge = masteryBadge(mastery)
                return (
                  <div key={sec}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{sectionLabel(sec)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${badge.color}`}>{badge.label}</span>
                        <span className="text-xs font-mono text-gray-400">{Math.round(mastery * 100)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          background: mastery >= 0.8 ? '#4ade80' : mastery >= 0.6 ? '#fbbf24' : '#4A8FA3',
                          width: `${mastery * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mock History + Recommendations */}
          <div className="space-y-4">
            {/* Mock History */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Recent Mocks</h2>
                <Link href="/mock" className="text-xs" style={{ color: '#4A8FA3' }}>
                  Take Mock →
                </Link>
              </div>
              {mocks.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm mb-2">No mock tests yet</div>
                  <Link href="/mock" className="text-xs px-4 py-2 rounded-lg" style={{ background: '#4A8FA3', color: 'white' }}>
                    Start First Mock
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {mocks.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className="text-white text-sm font-mono font-bold">{m.score}</span>
                        <span className="text-gray-500 text-xs ml-2">{m.completedAt?.toLocaleDateString()}</span>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
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

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-bold text-white mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec) => (
                    <Link
                      key={rec.title}
                      href={rec.href}
                      className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-white/5 block"
                    >
                      <span className="text-xl flex-shrink-0">{rec.icon}</span>
                      <div>
                        <div className="text-white text-sm font-medium">{rec.title}</div>
                        <div className="text-gray-500 text-xs">{rec.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
