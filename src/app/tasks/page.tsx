'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { listTasks, type Task } from '@/app/lib/tasksStore'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const t = listTasks()
    setTasks(t)
    setSelectedId(t[0]?.id ?? null)
  }, [])

  const selected = useMemo(() => tasks.find((t) => t.id === selectedId) ?? null, [tasks, selectedId])

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href="/">← 返回</Link>
        <a className="text-sm underline" href="https://flights.ctrip.com/online/channel/domestic" target="_blank" rel="noreferrer">
          打开携程机票
        </a>
      </div>

      <h1 className="text-2xl font-semibold">任务详情</h1>

      {tasks.length === 0 ? (
        <div className="text-sm text-gray-600">暂无任务（请先在首页创建）。</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <aside className="rounded-lg border bg-white p-3 space-y-2">
            <div className="text-sm font-medium">任务</div>
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li key={t.id}>
                  <button
                    className={`w-full text-left text-sm px-2 py-1 rounded ${t.id === selectedId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="md:col-span-2 rounded-lg border bg-white p-4 space-y-3">
            {selected ? (
              <>
                <div className="space-y-1">
                  <div className="text-xl font-semibold">{selected.name}</div>
                  <div className="text-sm text-gray-600">
                    平台：{selected.platform} · {selected.enabled ? '启用' : '停用'} · 每 {selected.checkEveryMinutes} 分钟
                  </div>
                  <div className="text-xs text-gray-500 break-all">{selected.targetUrl}</div>
                </div>

                <div className="rounded border p-3 text-sm space-y-1">
                  <div>行程：{selected.ctripFlight.from} → {selected.ctripFlight.to}</div>
                  <div>出发：{selected.ctripFlight.departDate}</div>
                  <div>类型：{selected.ctripFlight.tripType === 'round' ? '往返' : '单程'}{selected.ctripFlight.stayDays ? ` · 停留 ${selected.ctripFlight.stayDays} 天` : ''}</div>
                  <div>阈值：{typeof selected.notifyBelowPrice === 'number' ? `${selected.notifyBelowPrice} 元` : '未设置'}</div>
                </div>

                <div className="text-sm text-gray-600">
                  说明：当前为离线静态 UI，抓取/快照/飞书推送功能会在下一版接入（需要 Tauri 后端/本地数据库）。
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">请选择一个任务。</div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
