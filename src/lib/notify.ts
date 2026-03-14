import notifier from 'node-notifier'

export async function notify(title: string, message: string) {
  const mode = process.env.NOTIFY_MODE ?? 'system'
  if (mode === 'off') return

  // Best-effort system notification. On some environments it may fail silently.
  await new Promise<void>((resolve) => {
    notifier.notify(
      {
        title,
        message,
        wait: false,
      },
      () => resolve(),
    )
  })
}
