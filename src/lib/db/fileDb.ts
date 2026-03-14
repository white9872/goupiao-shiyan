import fs from 'fs/promises'
import path from 'path'
import { Task, PriceSnapshot, NotificationLog } from '@/lib/types'
import { nowIso, uuid } from '@/lib/util'

export type FileDbShape = {
  tasks: Task[]
  snapshots: PriceSnapshot[]
  notifications: NotificationLog[]
}

const DEFAULT_DB: FileDbShape = {
  tasks: [],
  snapshots: [],
  notifications: [],
}

function dbPath() {
  // repoRoot/data/db.json
  return path.join(process.cwd(), 'data', 'db.json')
}

async function ensureDir() {
  await fs.mkdir(path.dirname(dbPath()), { recursive: true })
}

async function readDb(): Promise<FileDbShape> {
  await ensureDir()
  try {
    const raw = await fs.readFile(dbPath(), 'utf8')
    return JSON.parse(raw) as FileDbShape
  } catch {
    return DEFAULT_DB
  }
}

async function writeDb(db: FileDbShape) {
  await ensureDir()
  await fs.writeFile(dbPath(), JSON.stringify(db, null, 2), 'utf8')
}

export const fileDb = {
  async listTasks(): Promise<Task[]> {
    const db = await readDb()
    return db.tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getTask(id: string): Promise<Task | undefined> {
    const db = await readDb()
    return db.tasks.find((t) => t.id === id)
  },

  async createTask(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const db = await readDb()
    const t: Task = {
      ...input,
      id: uuid(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    db.tasks.push(t)
    await writeDb(db)
    return t
  },

  async updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
    const db = await readDb()
    const idx = db.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    db.tasks[idx] = {
      ...db.tasks[idx],
      ...patch,
      id,
      updatedAt: nowIso(),
    }
    await writeDb(db)
    return db.tasks[idx]
  },

  async deleteTask(id: string): Promise<boolean> {
    const db = await readDb()
    const before = db.tasks.length
    db.tasks = db.tasks.filter((t) => t.id !== id)
    // also delete related data (MVP 简化)
    db.snapshots = db.snapshots.filter((s) => s.taskId !== id)
    db.notifications = db.notifications.filter((n) => n.taskId !== id)
    await writeDb(db)
    return db.tasks.length !== before
  },

  async addSnapshot(s: Omit<PriceSnapshot, 'id' | 'capturedAt'> & { capturedAt?: string }): Promise<PriceSnapshot> {
    const db = await readDb()
    const snap: PriceSnapshot = {
      id: uuid(),
      capturedAt: s.capturedAt ?? nowIso(),
      ...s,
    }
    db.snapshots.push(snap)
    await writeDb(db)
    return snap
  },

  async listSnapshots(taskId: string, limit = 200): Promise<PriceSnapshot[]> {
    const db = await readDb()
    return db.snapshots
      .filter((s) => s.taskId === taskId)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
      .slice(0, limit)
  },

  async deleteSnapshotsForTask(taskId: string): Promise<number> {
    const db = await readDb()
    const before = db.snapshots.length
    db.snapshots = db.snapshots.filter((s) => s.taskId !== taskId)
    await writeDb(db)
    return before - db.snapshots.length
  },

  async deleteSnapshotsOlderThan(taskId: string, cutoffIso: string): Promise<number> {
    const db = await readDb()
    const before = db.snapshots.length
    db.snapshots = db.snapshots.filter((s) => !(s.taskId === taskId && s.capturedAt < cutoffIso))
    await writeDb(db)
    return before - db.snapshots.length
  },

  async addNotification(n: Omit<NotificationLog, 'id' | 'sentAt'> & { sentAt?: string }): Promise<NotificationLog> {
    const db = await readDb()
    const log: NotificationLog = {
      id: uuid(),
      sentAt: n.sentAt ?? nowIso(),
      ...n,
    }
    db.notifications.push(log)
    await writeDb(db)
    return log
  },
}
