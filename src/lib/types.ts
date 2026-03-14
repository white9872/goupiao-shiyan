export type Platform = 'damai' | 'ctrip' | '12306'

export type CtripFlightQuery = {
  tripType: 'oneway' | 'round'
  from: string // city/airport text, e.g. 上海(SHA)
  to: string // e.g. 北京(BJS)
  departDate: string // yyyy-mm-dd
  /**
   * For round trip: either provide returnDate directly, or provide stayDays (nights).
   */
  returnDate?: string // yyyy-mm-dd
  stayDays?: number // default 3 when omitted
}

export type Task = {
  id: string
  platform: Platform
  name: string
  /**
   * Target URL to open for manual booking.
   * For ctrip flights, this can be the domestic channel entry, or a booking/results URL.
   */
  targetUrl: string
  /** Platform-specific query config (MVP: ctrip flight search) */
  ctripFlight?: CtripFlightQuery

  enabled: boolean
  checkEveryMinutes: number // MVP 固定 30
  notifyBelowPrice?: number
  newLowWindowDays: number // 默认 7（也用于数据保留天数）
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
