import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// DELETE /api/tasks/:id/snapshots
// - ?mode=all (default): 删除该任务所有快照
// - ?mode=older_than_days&days=7: 删除早于 N 天的快照
const QuerySchema = z.object({
  mode: z.enum(['all', 'older_than_days']).default('all'),
  days: z.coerce.number().int().min(1).max(365).optional(),
})

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const url = new URL(req.url)
  const q = QuerySchema.safeParse({
    mode: url.searchParams.get('mode') ?? undefined,
    days: url.searchParams.get('days') ?? undefined,
  })
  if (!q.success) return NextResponse.json({ error: q.error.flatten() }, { status: 400 })

  if (q.data.mode === 'older_than_days') {
    const days = q.data.days ?? 7
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const deleted = await db.deleteSnapshotsOlderThan(id, cutoff)
    return NextResponse.json({ ok: true, deleted, cutoff })
  }

  const deleted = await db.deleteSnapshotsForTask(id)
  return NextResponse.json({ ok: true, deleted })
}
