import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Plan } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const search = searchParams.get('search') ?? ''
  const plan = searchParams.get('plan') ?? ''
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (plan) where.plan = plan

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        memory: true,
        _count: { select: { answers: true, mockAttempts: true } },
      },
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / perPage) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, userId, ...data } = body

    if (action === 'change_plan') {
      await db.user.update({ where: { id: userId }, data: { plan: data.plan as Plan } })
      await db.auditLog.create({
        data: { adminId: session.user.id, action: 'CHANGE_PLAN', target: userId, detail: `Changed to ${data.plan}` },
      })
    } else if (action === 'suspend') {
      await db.user.update({ where: { id: userId }, data: { suspended: true, suspendReason: data.reason } })
      await db.auditLog.create({
        data: { adminId: session.user.id, action: 'SUSPEND_USER', target: userId, detail: data.reason },
      })
    } else if (action === 'unsuspend') {
      await db.user.update({ where: { id: userId }, data: { suspended: false, suspendReason: null } })
      await db.auditLog.create({
        data: { adminId: session.user.id, action: 'UNSUSPEND_USER', target: userId },
      })
    } else if (action === 'extend_trial') {
      const user = await db.user.findUnique({ where: { id: userId } })
      const base = user?.trialEndsAt && user.trialEndsAt > new Date() ? user.trialEndsAt : new Date()
      const newExpiry = new Date(base.getTime() + data.days * 24 * 60 * 60 * 1000)
      await db.user.update({ where: { id: userId }, data: { trialEndsAt: newExpiry } })
      await db.auditLog.create({
        data: { adminId: session.user.id, action: 'EXTEND_TRIAL', target: userId, detail: `+${data.days}d` },
      })
    } else if (action === 'notify') {
      await db.notification.create({
        data: {
          userId: data.userId || null,
          title: data.title,
          body: data.body,
          type: data.type ?? 'info',
        },
      })
    } else if (action === 'add_note') {
      await db.adminNote.create({
        data: { userId, adminId: session.user.id, note: data.note },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/users POST]', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
