import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        trialEndsAt,
        memory: {
          create: {
            weakSections: [],
            strongSections: [],
            lastTopicsAsked: [],
            confusedTopics: [],
            masteredTopics: [],
            adminTags: [],
          },
        },
      },
    })

    await db.userMemoryEvent.create({
      data: {
        userId: user.id,
        type: 'registered',
        payload: { email, name, plan: 'FREE' },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
