import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { memoryEngine } from '@/lib/memory'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { topic } = await req.json()
    await memoryEngine.updateAfterChat(session.user.id, topic)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[memory/chat]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
