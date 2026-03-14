import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mem = await db.userMemory.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(mem)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const updated = await db.userMemory.update({
      where: { userId: session.user.id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[memory PATCH]', err)
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}
