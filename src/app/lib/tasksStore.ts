'use client'

export type Platform = 'ctrip'
export type TripType = 'oneway' | 'round'

export type Task = {
  id: string
  name: string
  platform: Platform
  enabled: boolean
  checkEveryMinutes: number
  newLowWindowDays: number
  notifyBelowPrice?: number
  targetUrl: string
  createdAt: string
  ctripFlight: {
    tripType: TripType
    from: string
    to: string
    departDate: string
    stayDays?: number
  }
}

const KEY = 'ticket_watcher_tasks_v1'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function listTasks(): Task[] {
  if (typeof window === 'undefined') return []
  return safeParse<Task[]>(localStorage.getItem(KEY), [])
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

export function addTask(task: Task) {
  const tasks = listTasks()
  tasks.unshift(task)
  saveTasks(tasks)
}

export function getTask(id: string): Task | undefined {
  return listTasks().find((t) => t.id === id)
}

export function removeTask(id: string) {
  const tasks = listTasks().filter((t) => t.id !== id)
  saveTasks(tasks)
}
