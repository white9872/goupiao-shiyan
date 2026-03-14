export async function sendFeishuText(text: string) {
  const url = process.env.FEISHU_WEBHOOK_URL
  if (!url) {
    // no-op if not configured
    return
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ msg_type: 'text', content: { text } }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`feishu webhook failed: ${res.status} ${body}`)
  }
}
