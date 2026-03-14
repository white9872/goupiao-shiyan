import { randomUUID } from 'crypto'

export function nowIso() {
  return new Date().toISOString()
}

export function uuid() {
  return randomUUID()
}

export function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)))
}
