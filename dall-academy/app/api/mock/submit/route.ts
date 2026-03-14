import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'
import { Section } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { attemptId, answers, timeTaken } = await req.json()

    const attempt = await db.mockAttempt.findUnique({
      where: { id: attemptId },
      include: { items: { include: { question: true } } },
    })

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Score the attempt
    let rawScore = 0
    const sectionBreakdown: Record<string, { correct: number; total: number }> = {}

    for (const item of attempt.items) {
      const section = item.question.section as string
      if (!sectionBreakdown[section]) {
        sectionBreakdown[section] = { correct: 0, total: 0 }
      }
      sectionBreakdown[section].total++

      const selected = answers[item.id]
      const isCorrect = selected === item.question.correctKey

      if (isCorrect) {
        rawScore++
        sectionBreakdown[section].correct++
      }

      // Update mock item
      await db.mockQuestionItem.update({
        where: { id: item.id },
        data: { selectedKey: selected },
      })
    }

    // Scale 200-800
    const totalQ = attempt.items.length
    const scaledScore = Math.round(200 + (rawScore / totalQ) * 600)
    const clampedScore = Math.max(200, Math.min(800, scaledScore))

    await db.mockAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score: clampedScore,
        rawScore,
        timeTaken,
        completedAt: new Date(),
        sectionBreakdown,
      },
    })

    // Update memory
    await memoryEngine.updateAfterMock(session.user.id, clampedScore, sectionBreakdown)

    return NextResponse.json({
      score: clampedScore,
      rawScore,
      totalQ,
      passed: clampedScore >= 542,
      sectionBreakdown,
    })
  } catch (err) {
    console.error('[mock/submit]', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
