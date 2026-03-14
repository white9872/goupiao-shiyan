import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CreateTaskSchema = z.object({
  platform: z.enum(['damai', 'ctrip', '12306']),
  name: z.string().min(1),
  targetUrl: z.string().url(),
  enabled: z.boolean().default(true),
  checkEveryMinutes: z.number().int().min(5).max(24 * 60).default(30),
  notifyBelowPrice: z.number().optional(),
  newLowWindowDays: z.number().int().min(1).max(60).default(7),
})

export async function GET() {
  const tasks = await db.listTasks()
  return NextResponse.json({ tasks })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = CreateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const task = await db.createTask(parsed.data)
  return NextResponse.json({ task }, { status: 201 })
}
