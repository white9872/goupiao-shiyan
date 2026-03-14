import Link from 'next/link'

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link className="text-sm underline" href="/">← 返回</Link>
        <div className="mt-4">任务不存在或服务未启动。</div>
      </main>
    )
  }
  const { task, snapshots } = await res.json()

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href="/">← 返回</Link>
        <a className="text-sm underline" href={task.targetUrl} target="_blank" rel="noreferrer">
          打开购票页面（支付手动）
        </a>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{task.name}</h1>
        <div className="text-sm text-gray-600">
          平台：{task.platform} · {task.enabled ? '启用' : '停用'} · 每 {task.checkEveryMinutes} 分钟
        </div>
        <div className="text-xs text-gray-500 break-all">{task.targetUrl}</div>
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-2">
        <h2 className="font-medium">最近抓取记录</h2>
        {snapshots.length === 0 ? (
          <div className="text-sm text-gray-600">暂无快照（还没跑抓取，或抓取未接入）。</div>
        ) : (
          <ul className="divide-y">
            {snapshots.map((s: unknown) => {
              const snap = s as { id: string; capturedAt: string; price: number; currency: string }
              return (
                <li key={snap.id} className="py-2 text-sm flex items-center justify-between">
                  <span>{new Date(snap.capturedAt).toLocaleString()}</span>
                  <span className="font-medium">
                    {snap.price} {snap.currency}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-2">
        <h2 className="font-medium">数据清理</h2>
        <p className="text-sm text-gray-700">默认保留 {task.newLowWindowDays} 天快照（worker 自动清理）。也可以手动清空：</p>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{`# 删除该任务所有快照\ncurl -X DELETE http://localhost:3000/api/tasks/${task.id}/snapshots\n\n# 仅删除早于 7 天的快照\ncurl -X DELETE "http://localhost:3000/api/tasks/${task.id}/snapshots?mode=older_than_days&days=7"`}</pre>
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-2">
        <h2 className="font-medium">下一步</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>接入抓取：先做携程机票（需要你给一个具体的“航班搜索结果页”链接）。</li>
          <li>接入飞书推送：配置 FEISHU_WEBHOOK_URL。</li>
          <li>加 UI 表单：在页面直接创建/编辑任务（不再用 curl）。</li>
        </ol>
      </section>
    </main>
  )
}
