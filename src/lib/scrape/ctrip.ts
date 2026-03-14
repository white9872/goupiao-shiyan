import { chromium, type Locator } from 'playwright'
import type { Task } from '@/lib/types'
import type { ScrapeResult } from '@/lib/scrape'

function parsePriceYuan(text: string): number | null {
  // supports: ¥123, ￥1,234
  const m = text.replace(/,/g, '').match(/[¥￥]\s*(\d+(?:\.\d+)?)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

async function fillCity(input: Locator, value: string) {
  await input.click({ timeout: 10_000 })
  await input.fill('')
  await input.type(value, { delay: 50 })
  // try pick first suggestion if present
  const firstOption = input.page().locator('.suggest_item, .m-suggest-item, li[role="option"]').first()
  if (await firstOption.count()) {
    await firstOption.click().catch(() => {})
  }
}

export async function scrapeCtripFlight(task: Task): Promise<ScrapeResult | null> {
  if (!task.ctripFlight) return null

  const headless = (process.env.PLAYWRIGHT_HEADLESS ?? '1') !== '0'
  const browser = await chromium.launch({ headless })
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  })
  const page = await ctx.newPage()

  try {
    const entry = 'https://flights.ctrip.com/online/channel/domestic'
    await page.goto(entry, { waitUntil: 'domcontentloaded', timeout: 60_000 })

    // trip type
    if (task.ctripFlight.tripType === 'round') {
      // click tab containing 往返
      const tab = page.getByText('往返', { exact: true }).first()
      await tab.click({ timeout: 10_000 }).catch(() => {})
    } else {
      const tab = page.getByText('单程', { exact: true }).first()
      await tab.click({ timeout: 10_000 }).catch(() => {})
    }

    const [fromInput, toInput] = await Promise.all([
      page.getByPlaceholder('可输入城市或机场').nth(0),
      page.getByPlaceholder('可输入城市或机场').nth(1),
    ])

    await fillCity(fromInput, task.ctripFlight.from)
    await fillCity(toInput, task.ctripFlight.to)

    // dates
    const departInput = page.getByPlaceholder('yyyy-mm-dd').first()
    await departInput.click({ timeout: 10_000 })
    await departInput.fill(task.ctripFlight.departDate)

    if (task.ctripFlight.tripType === 'round' && task.ctripFlight.returnDate) {
      // return input doesn't have stable placeholder on the page; pick the 2nd date input
      const allDateInputs = page.locator('input').filter({ hasText: /\d{4}-\d{2}-\d{2}/ }).first()
      // fallback: try fill via JS on focused element
      const returnCandidate = page.locator('input[placeholder=""]').first()
      await returnCandidate.click().catch(() => {})
      await returnCandidate.fill(task.ctripFlight.returnDate).catch(async () => {
        await page.keyboard.type(task.ctripFlight.returnDate, { delay: 20 })
      })
      void allDateInputs
    }

    // search
    const searchBtn = page.getByRole('button', { name: /搜索/ }).first()
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => null),
      searchBtn.click({ timeout: 10_000 }),
    ])

    const url = page.url()

    // Heuristic price extraction:
    // find many occurrences of ￥/¥ and take the minimum.
    await page.waitForTimeout(1500)
    const texts = await page.locator('text=/[¥￥]\s*\d+/').allTextContents().catch(() => [])
    const candidates = texts
      .map(parsePriceYuan)
      .filter((n): n is number => typeof n === 'number' && n > 0)
      .sort((a, b) => a - b)

    if (candidates.length === 0) {
      // as fallback, return null but include url in logs by throwing
      throw new Error(`no price found on result page; url=${url}`)
    }

    return {
      price: candidates[0],
      currency: 'CNY',
      status: 'available',
      url,
    }
  } finally {
    await page.close().catch(() => {})
    await ctx.close().catch(() => {})
    await browser.close().catch(() => {})
  }
}
