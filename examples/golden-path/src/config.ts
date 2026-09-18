import type { OpenAICompletionModelId } from '@anvia/openai'

/**
 * Every value the application cannot invent at runtime. `loadConfig` fails fast
 * with one message listing everything that is missing, instead of failing later
 * inside a provider call or an exporter.
 */
export type GoldenPathConfig = Readonly<{
  openai: Readonly<{
    apiKey: string
    /** Optional override for gateways, proxies, and local model mocks. */
    baseUrl?: string
    modelId: OpenAICompletionModelId
  }>
  discord: Readonly<{
    botToken: string
    /** Channel used for replies and for proactive reports. */
    conversationId: string
    /** SQLite file that keeps paused approvals and questions resumable. */
    interactionDatabase: string
  }>
  lens: Readonly<{
    baseUrl: string
    publicKey: string
    secretKey: string
    serviceName: string
    environment: string
    release?: string
  }>
  agent: Readonly<{
    id: string
    name: string
    /** SQLite file that keeps conversation history per channel session. */
    memoryDatabase: string
  }>
}>

const DEFAULTS = {
  modelId: 'gpt-5.6-sol',
  agentId: 'golden-path-support',
  agentName: 'golden-path-support',
  interactionDatabase: 'data/channel-interactions.sqlite',
  memoryDatabase: 'data/agent-memory.sqlite',
  lensServiceName: 'golden-path-support',
  lensEnvironment: 'development',
} as const

export function loadConfig(env: Readonly<Record<string, string | undefined>> = process.env): GoldenPathConfig {
  const missing: string[] = []

  // Both readers treat a blank value as absent, so `.env` lines that are left
  // empty or copied from the template behave like missing values.
  const required = (name: string): string => {
    const value = env[name]?.trim()
    if (value !== undefined && value.length > 0) return value
    missing.push(name)
    return ''
  }

  const optional = (name: string): string | undefined => env[name]?.trim() || undefined

  const openai = {
    apiKey: required('OPENAI_API_KEY'),
    baseUrl: optional('OPENAI_BASE_URL'),
    modelId: (optional('OPENAI_MODEL_ID') ?? DEFAULTS.modelId) as OpenAICompletionModelId,
  }
  const discord = {
    botToken: required('DISCORD_BOT_TOKEN'),
    conversationId: required('DISCORD_CHANNEL_ID'),
    interactionDatabase: optional('CHANNEL_INTERACTION_DATABASE') ?? DEFAULTS.interactionDatabase,
  }
  const lens = {
    baseUrl: required('ANVIA_LENS_BASE_URL'),
    publicKey: required('ANVIA_LENS_PUBLIC_KEY'),
    secretKey: required('ANVIA_LENS_SECRET_KEY'),
    serviceName: optional('ANVIA_LENS_SERVICE_NAME') ?? DEFAULTS.lensServiceName,
    environment: optional('ANVIA_LENS_ENVIRONMENT') ?? DEFAULTS.lensEnvironment,
    release: optional('ANVIA_LENS_RELEASE'),
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`,
    )
  }

  return {
    openai,
    discord,
    lens,
    agent: {
      id: DEFAULTS.agentId,
      name: DEFAULTS.agentName,
      memoryDatabase: optional('AGENT_MEMORY_DATABASE') ?? DEFAULTS.memoryDatabase,
    },
  }
}
