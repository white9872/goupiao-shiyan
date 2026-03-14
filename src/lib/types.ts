export type Platform = 'damai' | 'ctrip' | '12306'

export type Task = {
  id: string
  platform: Platform
  name: string
  targetUrl: string
  enabled: boolean
  checkEveryMinutes: number // MVP 固定 30
  notifyBelowPrice?: number
  newLowWindowDays: number // MVP 固定 7
  createdAt: string
  updatedAt: string
}

export type PriceSnapshot = {
  id: string
  taskId: string
  price: number
  currency: string
  status: 'unknown' | 'available' | 'sold_out'
  url: string
  capturedAt: string
}

export type NotificationLog = {
  id: string
  taskId: string
  kind: 'new_low' | 'below_threshold' | 'error'
  message: string
  sentAt: string
  success: boolean
  error?: string
}
