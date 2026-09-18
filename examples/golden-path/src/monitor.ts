import { createSupportApp } from './app.js'
import { loadConfig } from './config.js'

/**
 * Proactive delivery worker: it never calls `service.start()`, so it has no
 * receive loop and no gateway connection. Use this shape for cron jobs,
 * alerting, and scheduled reports.
 */
const config = loadConfig()
const app = await createSupportApp({ config })

try {
  const report = await app.report()
  const delivered = await app.notify(report)
  console.log(`[monitor] delivered ${delivered.length} message part(s): ${delivered.map((part) => part.id).join(', ')}`)

  // Short-lived processes should make delivery deterministic before exiting.
  await app.lens.flush()
} finally {
  await app.shutdown()
}
