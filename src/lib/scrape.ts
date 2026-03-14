import { Task } from '@/lib/types'
import { scrapeCtripFlight } from '@/lib/scrape/ctrip'

export type ScrapeResult = {
  price: number
  currency: string
  status: 'unknown' | 'available' | 'sold_out'
  url: string
}

// MVP：先把框架跑通（任务->抓取->快照->推送）。
// 各平台的真实抓取规则逐个补。
export async function scrapePrice(task: Task): Promise<ScrapeResult | null> {
  switch (task.platform) {
    case 'damai':
      return await scrapeDamai(task)
    case 'ctrip':
      return await scrapeCtrip(task)
    case '12306':
      return await scrape12306(task)
    default:
      return null
  }
}

async function scrapeDamai(task: Task): Promise<ScrapeResult | null> {
  console.log('[scrape] damai TODO', task.targetUrl)
  return null
}

async function scrapeCtrip(task: Task): Promise<ScrapeResult | null> {
  return await scrapeCtripFlight(task)
}

async function scrape12306(task: Task): Promise<ScrapeResult | null> {
  console.log('[scrape] 12306 TODO', task.targetUrl)
  return null
}
