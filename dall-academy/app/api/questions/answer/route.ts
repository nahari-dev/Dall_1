import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'
import { Section } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { questionId, selectedKey, timeSpent } = await req.json()
    const userId = session.user.id

    const question = await db.question.findUnique({ where: { id: questionId } })
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    const isCorrect = selectedKey === question.correctKey

    await db.userAnswer.create({
      data: { userId, questionId, selectedKey, isCorrect, timeSpent: timeSpent ?? 0 },
    })

    await memoryEngine.updateAfterAnswer(
      userId,
      questionId,
      isCorrect,
      question.section as Section,
      timeSpent ?? 0
    )

    return NextResponse.json({ isCorrect, correctKey: question.correctKey })
  } catch (err) {
    console.error('[answer]', err)
    return NextResponse.json({ error: 'Failed to record answer' }, { status: 500 })
  }
}
