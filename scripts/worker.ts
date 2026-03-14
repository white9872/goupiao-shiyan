import cron from 'node-cron'
import { db } from '@/lib/db'
import { scrapePrice } from '@/lib/scrape'
import { sendFeishuText } from '@/lib/feishu'
import { notify } from '@/lib/notify'

async function runOnce() {
  const tasks = await db.listTasks()

  // retention: keep last 7 days snapshots by default (per-task config exists: newLowWindowDays)
  for (const t of tasks) {
    const keepDays = Math.max(1, t.newLowWindowDays || 7)
    const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000).toISOString()
    const deleted = await db.deleteSnapshotsOlderThan(t.id, cutoff)
    if (deleted > 0) console.log(`[worker] retention pruned ${deleted} snapshots for ${t.name}`)
  }

  const enabled = tasks.filter((t) => t.enabled)
  for (const t of enabled) {
    try {
      const result = await scrapePrice(t)
      if (!result) continue

      const snap = await db.addSnapshot({
        taskId: t.id,
        price: result.price,
        currency: result.currency,
        status: result.status,
        url: result.url,
      })

      // MVP: 仅当低于阈值时通知（近期新低逻辑后续补）
      if (typeof t.notifyBelowPrice === 'number' && snap.price > 0 && snap.price <= t.notifyBelowPrice) {
        await sendFeishuText(`【低价提醒】${t.name}\n当前价：${snap.price} ${snap.currency}\n链接：${snap.url}`)
        await db.addNotification({
          taskId: t.id,
          kind: 'below_threshold',
          message: `price=${snap.price} <= ${t.notifyBelowPrice}`,
          success: true,
        })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      await db.addNotification({
        taskId: t.id,
        kind: 'error',
        message: msg,
        success: false,
        error: msg,
      })
      // errors are noisy; only send to Feishu when configured
      await sendFeishuText(`【抓取失败】${t.name}\n原因：${msg}`).catch(() => {})
      await notify('Ticket Watcher · 抓取失败', `${t.name}\n${msg}`)
    }
  }
}

async function dailySummary() {
  const tasks = await db.listTasks()
  const enabled = tasks.filter((t) => t.enabled)
  const today = new Date().toISOString().slice(0, 10)

  for (const t of enabled) {
    const snaps = await db.listSnapshots(t.id, 2000)
    // only consider today's snapshots
    const todays = snaps.filter((s) => s.capturedAt.slice(0, 10) === today)
    if (todays.length === 0) continue
    const min = todays.reduce((a, b) => (b.price < a.price ? b : a))

    const msg = `今日最低（基础总价口径）：${min.price} ${min.currency}\n${t.name}\n${min.url}`
    await notify('Ticket Watcher · 09:00 日报', msg)
    // If Feishu webhook is configured, also send (optional)
    await sendFeishuText(`【09:00 日报】\n${msg}`).catch(() => {})
  }
}

async function main() {
  console.log('[worker] starting; schedule: every 30 minutes + daily 09:00 summary')
  // run immediately once
  await runOnce()

  // every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    void runOnce()
  }, { timezone: 'Asia/Shanghai' })

  // daily at 09:00
  cron.schedule('0 9 * * *', () => {
    void dailySummary()
  }, { timezone: 'Asia/Shanghai' })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
