import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Section, Difficulty } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const question = await db.question.create({
      data: {
        qnum: body.qnum,
        section: body.section as Section,
        difficulty: body.difficulty as Difficulty,
        textEn: body.textEn,
        textAr: body.textAr,
        options: body.options,
        correctKey: body.correctKey,
        explanationEn: body.explanationEn,
        explanationAr: body.explanationAr,
        reference: body.reference,
        tags: body.tags ?? [],
      },
    })

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_QUESTION',
        target: question.id,
        detail: `Created Q${question.qnum}`,
      },
    })

    return NextResponse.json(question)
  } catch (err) {
    console.error('[admin/questions POST]', err)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...data } = body

    const question = await db.question.update({
      where: { id },
      data: {
        qnum: data.qnum,
        section: data.section as Section,
        difficulty: data.difficulty as Difficulty,
        textEn: data.textEn,
        textAr: data.textAr,
        options: data.options,
        correctKey: data.correctKey,
        explanationEn: data.explanationEn,
        explanationAr: data.explanationAr,
        reference: data.reference,
        tags: data.tags ?? [],
      },
    })

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_QUESTION',
        target: id,
        detail: `Updated Q${question.qnum}`,
      },
    })

    return NextResponse.json(question)
  } catch (err) {
    console.error('[admin/questions PUT]', err)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    await db.question.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_QUESTION',
        target: id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/questions DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
