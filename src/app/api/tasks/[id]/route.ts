import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const PatchSchema = z.object({
  platform: z.enum(['damai', 'ctrip', '12306']).optional(),
  name: z.string().min(1).optional(),
  targetUrl: z.string().url().optional(),
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
  const patch: Partial<{ notifyBelowPrice?: number }> & typeof parsed.data = { ...parsed.data }
  // allow clearing notifyBelowPrice
  if (patch.notifyBelowPrice === null) patch.notifyBelowPrice = undefined

  const task = await db.updateTask(id, patch)
  if (!task) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const ok = await db.deleteTask(id)
  return NextResponse.json({ ok })
}
