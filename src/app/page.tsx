'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CreateTaskForm from '@/app/components/CreateTaskForm'
import { listTasks, type Task, removeTask } from '@/app/lib/tasksStore'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(listTasks())
  }, [])

  function refresh() {
    setTasks(listTasks())
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Ticket Watcher</h1>
        <p className="text-sm text-gray-600">
          当前安装包是“离线静态 UI 壳”（为了能在 GitHub CI 直接打包）。任务临时保存在本机 localStorage；抓取/推送 worker 仍需后续接入。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">创建监控任务（携程机票）</h2>
          <button className="text-sm underline" onClick={refresh}>刷新列表</button>
        </div>
        <div className="text-sm text-gray-600">默认：每 30 分钟抓取一次、保留 7 天。</div>
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
            {tasks.map((task) => (
              <li key={task.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-xs text-gray-600">
                    平台：{task.platform} · 间隔：{task.checkEveryMinutes} 分钟 · {task.enabled ? '启用' : '停用'}
                  </div>
                  <div className="text-xs text-gray-500 break-all">{task.targetUrl}</div>
                  <div className="text-xs text-gray-500">{task.ctripFlight.from} → {task.ctripFlight.to} · {task.ctripFlight.departDate}</div>
                </div>
                <div className="shrink-0 space-x-3">
                  <Link className="text-sm underline" href="/tasks">查看详情</Link>
                  <button
                    className="text-sm underline text-red-600"
                    onClick={() => {
                      removeTask(task.id)
                      refresh()
                    }}
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
