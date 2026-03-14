import { Task } from '@/lib/types'

export type ScrapeResult = {
  price: number
  currency: string
  status: 'unknown' | 'available' | 'sold_out'
  url: string
}

// MVP：先把框架跑通（任务->抓取->快照->推送）。
// 各平台的真实抓取规则后续逐个补。
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
  // TODO: Playwright 抓取（大麦 App/网页可能需要登录+风控；优先网页能抓到的价格信息）
  // 临时占位：不抓取
  console.log('[scrape] damai TODO', task.targetUrl)
  return null
}

async function scrapeCtrip(task: Task): Promise<ScrapeResult | null> {
  // TODO: Playwright 抓取
  console.log('[scrape] ctrip TODO', task.targetUrl)
  return null
}

async function scrape12306(task: Task): Promise<ScrapeResult | null> {
  // TODO: 12306 票价/余票接口与页面结构需要确认。MVP 可先做“打开链接 + 人工查看”。
  console.log('[scrape] 12306 TODO', task.targetUrl)
  return null
}
