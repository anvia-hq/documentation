import { createSupportApp } from './app.js'
import { loadConfig } from './config.js'

const config = loadConfig()
const app = await createSupportApp({ config })

await app.service.start()
console.log(`[golden-path] ${config.agent.name} is listening on Discord channel ${config.discord.conversationId}.`)
console.log('[golden-path] Press Ctrl+C to stop.')

let stopping = false

async function stop(signal: string): Promise<void> {
  if (stopping) return
  stopping = true
  console.log(`[golden-path] ${signal} received, shutting down.`)

  try {
    await app.shutdown()
  } catch (error) {
    console.error('[golden-path] shutdown failed', error)
    process.exitCode = 1
  }
}

process.once('SIGINT', () => void stop('SIGINT'))
process.once('SIGTERM', () => void stop('SIGTERM'))
