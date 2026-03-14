import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { memoryEngine } from '@/lib/memory'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { topic, rating } = await req.json()
    if (!topic || !['helpful', 'not_helpful'].includes(rating))
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    await memoryEngine.updateAfterFeedback(session.user.id, topic, rating)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[feedback]', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
