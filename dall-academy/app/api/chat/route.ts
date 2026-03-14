import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runGuiderAgent } from '@/lib/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { messages } = await req.json()
    const result = await runGuiderAgent(session.user.id, messages)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
