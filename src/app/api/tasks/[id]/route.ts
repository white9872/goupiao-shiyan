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

const PatchSchema = z.object({
  platform: z.enum(['damai', 'ctrip', '12306']).optional(),
  name: z.string().min(1).optional(),
  targetUrl: z.string().url().optional(),
  ctripFlight: CtripFlightSchema.optional().nullable(),
  enabled: z.boolean().optional(),
  checkEveryMinutes: z.number().int().min(5).max(24 * 60).optional(),
  notifyBelowPrice: z.number().optional().nullable(),
  newLowWindowDays: z.number().int().min(1).max(60).optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const task = await db.getTask(id)
  if (!task) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const snapshots = await db.listSnapshots(id, 200)
  return NextResponse.json({ task, snapshots })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const { notifyBelowPrice, ctripFlight, ...rest } = data

  // Normalize nullables (null -> undefined) to match our Task type
  const patch = {
    ...rest,
    ...(notifyBelowPrice == null ? {} : { notifyBelowPrice }),
    ...(ctripFlight == null ? {} : { ctripFlight }),
  }

  const task = await db.updateTask(id, patch)
  if (!task) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const ok = await db.deleteTask(id)
  return NextResponse.json({ ok })
}
