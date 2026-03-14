import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch 200 random questions
    const questions = await db.question.findMany({
      take: 200,
      orderBy: { usageCount: 'asc' },
      select: { id: true },
    })

    if (questions.length < 10) {
      return NextResponse.json({ error: 'Not enough questions in database' }, { status: 400 })
    }

    // Shuffle
    const shuffled = questions.sort(() => Math.random() - 0.5)

    const attempt = await db.mockAttempt.create({
      data: {
        userId: session.user.id,
        items: {
          create: shuffled.map((q, idx) => ({
            questionId: q.id,
            order: idx + 1,
          })),
        },
      },
    })

    return NextResponse.json({ attemptId: attempt.id })
  } catch (err) {
    console.error('[mock/start]', err)
    return NextResponse.json({ error: 'Failed to start mock' }, { status: 500 })
  }
}
