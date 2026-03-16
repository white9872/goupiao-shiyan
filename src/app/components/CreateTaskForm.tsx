'use client'

import { useState } from 'react'
import { addTask, type Platform, type Task, type TripType } from '@/app/lib/tasksStore'

export default function CreateTaskForm() {
  const [platform] = useState<Platform>('ctrip')
  const [name, setName] = useState('携程机票监控')
  const [from, setFrom] = useState('上海(SHA)')
  const [to, setTo] = useState('北京(BJS)')
  const [tripType, setTripType] = useState<TripType>('round')
  const [departDate, setDepartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [stayDays, setStayDays] = useState('3')
  const [notifyBelowPrice, setNotifyBelowPrice] = useState('')
  const [enabled, setEnabled] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMsg(null)
    try {
      const task: Task = {
        id: crypto.randomUUID(),
        platform,
        name,
        targetUrl: 'https://flights.ctrip.com/online/channel/domestic',
        enabled,
        checkEveryMinutes: 30,
        newLowWindowDays: 7,
        createdAt: new Date().toISOString(),
        ctripFlight: {
          tripType,
          from,
          to,
          departDate,
          ...(tripType === 'round'
            ? {
                stayDays: stayDays.trim() ? Number(stayDays.trim()) : 3,
              }
            : {}),
        },
        ...(notifyBelowPrice.trim() ? { notifyBelowPrice: Number(notifyBelowPrice.trim()) } : {}),
      }

      addTask(task)
      setMsg('创建成功（已保存到本机 localStorage）')
    } catch (err) {
      setMsg(`创建失败：${String(err)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm">
          <div className="text-gray-700">任务名</div>
          <input className="mt-1 w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="text-sm">
          <div className="text-gray-700">价格阈值（总价，元，可选）</div>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={notifyBelowPrice}
            onChange={(e) => setNotifyBelowPrice(e.target.value)}
            placeholder="例如 800"
            inputMode="numeric"
          />
        </label>

        <label className="text-sm">
          <div className="text-gray-700">行程</div>
          <select className="mt-1 w-full rounded border px-3 py-2" value={tripType} onChange={(e) => setTripType(e.target.value as TripType)}>
            <option value="oneway">单程</option>
            <option value="round">往返</option>
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-700">启用</div>
          <div className="mt-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span className="ml-2 text-gray-700">开始监控</span>
          </div>
        </label>

        <label className="text-sm">
          <div className="text-gray-700">出发地（城市或机场）</div>
          <input className="mt-1 w-full rounded border px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm">
          <div className="text-gray-700">目的地（城市或机场）</div>
          <input className="mt-1 w-full rounded border px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>

        <label className="text-sm">
          <div className="text-gray-700">出发日期</div>
          <input className="mt-1 w-full rounded border px-3 py-2" value={departDate} onChange={(e) => setDepartDate(e.target.value)} placeholder="yyyy-mm-dd" />
        </label>

        {tripType === 'round' ? (
          <label className="text-sm">
            <div className="text-gray-700">停留天数（不填默认 3 天）</div>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={stayDays}
              onChange={(e) => setStayDays(e.target.value)}
              placeholder="3"
              inputMode="numeric"
            />
          </label>
        ) : null}
      </div>

      <button disabled={submitting} className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-50">
        {submitting ? '创建中…' : '创建任务'}
      </button>

      {msg ? <div className="text-sm text-gray-700">{msg}</div> : null}

      <div className="text-xs text-gray-500">
        口径：总价=票面价+税费（机建/燃油等）。不含可选保险/加购服务；不考虑优惠券/会员价。
      </div>
    </form>
  )
}
