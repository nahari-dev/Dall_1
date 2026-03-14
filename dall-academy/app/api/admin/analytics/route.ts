import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [totalUsers, allMocks, sectionProgress, topConfused] = await Promise.all([
    db.user.count(),
    db.mockAttempt.findMany({ where: { status: 'COMPLETED' }, select: { score: true } }),
    db.userProgress.groupBy({ by: ['section'], _avg: { mastery: true } }),
    db.userMemory.findMany({ select: { confusedTopics: true } }),
  ])

  const allConfused = topConfused.flatMap((m) => m.confusedTopics)
  const topicCounts: Record<string, number> = {}
  allConfused.forEach((t) => { topicCounts[t] = (topicCounts[t] ?? 0) + 1 })
  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const avgScore = allMocks.length > 0
    ? Math.round(allMocks.reduce((s, m) => s + (m.score ?? 0), 0) / allMocks.length)
    : null

  const passRate = allMocks.length > 0
    ? Math.round((allMocks.filter((m) => (m.score ?? 0) >= 542).length / allMocks.length) * 100)
    : null

  return NextResponse.json({
    totalUsers,
    avgScore,
    passRate,
    totalMocks: allMocks.length,
    sectionProgress,
    topConfusedTopics: sortedTopics,
  })
}
