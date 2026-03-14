import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { memoryEngine } from '@/lib/memory'
import { db } from '@/lib/db'
import { sectionLabel } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const mem = await memoryEngine.getMemory(session.user.id)
    const ctx = memoryEngine.buildPersonalizationContext(mem)

    // Get all progress to find lowest mastery
    const progress = await db.userProgress.findMany({ where: { userId: session.user.id } })
    const allSections = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE']

    const focusSection =
      ctx.weakSections[0] ??
      progress.sort((a, b) => a.mastery - b.mastery)[0]?.section ??
      'PERIODONTICS'

    const questionCount = ctx.dailyGoal
    const difficulty =
      ctx.consecutiveFails > 1 ? 'EASY' : ctx.urgencyLevel === 'critical' ? 'INTERMEDIATE' : 'INTERMEDIATE'

    const estimatedMins = Math.round(questionCount * 1.5)

    // Build blocks for short-session preference
    let blocks = undefined
    if (mem.prefersShortSess) {
      const blockCount = Math.ceil(questionCount / 3)
      blocks = [
        { label: 'Block 1', questions: blockCount, minutes: Math.round(blockCount * 1.5) },
        { label: '🍵 Break', questions: 0, minutes: 5 },
        { label: 'Block 2', questions: blockCount, minutes: Math.round(blockCount * 1.5) },
        { label: '🍵 Break', questions: 0, minutes: 5 },
        { label: 'Block 3', questions: questionCount - blockCount * 2, minutes: Math.round((questionCount - blockCount * 2) * 1.5) },
      ]
    }

    const guiderTopic =
      ctx.confusedTopics.length > 0 ? ctx.confusedTopics[0] : null

    let message = `Today's focus: ${sectionLabel(focusSection)}`
    if (ctx.daysUntilExam && ctx.daysUntilExam < 7) {
      message = `⚠️ Exam in ${ctx.daysUntilExam} days — treat every session as real!`
    } else if (ctx.consecutiveFails > 1) {
      message = `Start with easier questions to build confidence 💪`
    }

    return NextResponse.json({
      focusSection,
      questionCount,
      estimatedTime: estimatedMins,
      difficulty,
      guiderTopic,
      blocks,
      message,
    })
  } catch (err) {
    console.error('[study-plan]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
