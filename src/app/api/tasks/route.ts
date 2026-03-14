import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CtripFlightSchema = z
  .object({
    tripType: z.enum(['oneway', 'round']).default('oneway'),
    from: z.string().min(1),
    to: z.string().min(1),
    departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    stayDays: z.number().int().min(1).max(60).optional(),
  })
  .refine((v) => v.tripType === 'oneway' || !!v.returnDate || typeof v.stayDays === 'number', {
    message: 'returnDate or stayDays required when tripType=round',
    path: ['returnDate'],
  })

const CreateTaskSchema = z.object({
  platform: z.enum(['damai', 'ctrip', '12306']),
  name: z.string().min(1),
  targetUrl: z.string().url(),
  ctripFlight: CtripFlightSchema.optional(),
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
