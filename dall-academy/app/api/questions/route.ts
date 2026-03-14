import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'
import { Section, Difficulty } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const smart = searchParams.get('smart') === 'true'
  const section = searchParams.get('section') as Section | null
  const difficulty = searchParams.get('difficulty') as Difficulty | null
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)

  try {
    if (smart) {
      const mem = await memoryEngine.getMemory(session.user.id)
      const allSections: Section[] = [
        'PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE',
      ]

      const weakSections = mem.weakSections as Section[]
      const strongSections = mem.strongSections as Section[]
      const midSections = allSections.filter(
        (s) => !weakSections.includes(s) && !strongSections.includes(s)
      )

      // Distribution: 40% weak, 30% mid, 20% strong, 10% new
      const counts = {
        weak: Math.floor(limit * 0.4),
        mid: Math.floor(limit * 0.3),
        strong: Math.floor(limit * 0.2),
        fresh: Math.ceil(limit * 0.1),
      }

      const [weakQ, midQ, strongQ] = await Promise.all([
        weakSections.length > 0
          ? db.question.findMany({
              where: { section: { in: weakSections } },
              take: counts.weak,
              orderBy: { usageCount: 'asc' },
            })
          : [],
        midSections.length > 0
          ? db.question.findMany({
              where: { section: { in: midSections } },
              take: counts.mid,
              orderBy: { usageCount: 'asc' },
            })
          : [],
        strongSections.length > 0
          ? db.question.findMany({
              where: { section: { in: strongSections } },
              take: counts.strong,
              orderBy: { usageCount: 'asc' },
            })
          : [],
      ])

      const questions = [...weakQ, ...midQ, ...strongQ]
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)

      return NextResponse.json({ questions, smart: true })
    }

    // Manual mode
    const where: Record<string, unknown> = {}
    if (section) where.section = section
    if (difficulty) where.difficulty = difficulty

    const questions = await db.question.findMany({
      where,
      take: limit,
      orderBy: { usageCount: 'asc' },
    })

    return NextResponse.json({ questions, smart: false })
  } catch (err) {
    console.error('[questions]', err)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
