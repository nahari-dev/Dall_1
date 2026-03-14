import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryEngine } from '@/lib/memory'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await db.user.findMany({
      select: { id: true },
      where: { suspended: false },
    })

    await Promise.allSettled(users.map((u) => memoryEngine.updateStreak(u.id)))

    return NextResponse.json({ ok: true, updated: users.length })
  } catch (err) {
    console.error('[cron/streak]', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
