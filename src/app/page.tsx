import Link from 'next/link'
import CreateTaskForm from '@/app/components/CreateTaskForm'

export default async function Home() {
  const res = await fetch('http://localhost:3000/api/tasks', { cache: 'no-store' }).catch(() => null)
  const data = res && res.ok ? ((await res.json()) as { tasks: unknown[] }) : { tasks: [] as unknown[] }
  const tasks = data.tasks ?? []

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Ticket Watcher</h1>
        <p className="text-sm text-gray-600">
          半小时抓取一次票价；飞书推送低价；辅助下单跳到支付前（支付手动）。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-3">
        <h2 className="font-medium">创建监控任务（携程机票）</h2>
        <div className="text-sm text-gray-600">默认：1 成人、经济舱、直飞+中转都算、每 30 分钟抓取一次、保留 7 天。</div>
        <CreateTaskForm />
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">任务列表</h2>
          <Link className="text-sm underline" href="/health">健康检查</Link>
        </div>
        {tasks.length === 0 ? (
          <div className="text-sm text-gray-600">暂无任务</div>
        ) : (
          <ul className="divide-y">
            {tasks.map((t) => {
              const task = t as {
                id: string
                name: string
                platform: string
                checkEveryMinutes: number
                enabled: boolean
                targetUrl: string
              }
              return (
                <li key={task.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-gray-600">
                      平台：{task.platform} · 间隔：{task.checkEveryMinutes} 分钟 · {task.enabled ? '启用' : '停用'}
                    </div>
                    <div className="text-xs text-gray-500 break-all">{task.targetUrl}</div>
                  </div>
                  <Link className="text-sm underline" href={`/tasks/${task.id}`}>详情</Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
