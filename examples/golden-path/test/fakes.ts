import { createServer, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { ChannelMessage } from '@anvia/channel'
import type {
  DiscordGateway,
  DiscordGatewayEvent,
  DiscordGatewayHandler,
  DiscordGatewayMessage,
  DiscordGatewaySentMessage,
} from '@anvia/discord'

type StubToolCall = Readonly<{
  id: string
  type: 'function'
  function: Readonly<{ name: string; arguments: string }>
}>

type StubChatMessage = Readonly<{
  role: string
  content?: string | null
  tool_calls?: readonly StubToolCall[]
}>

export type StubChatRequest = Readonly<{
  model: string
  stream?: boolean
  messages: readonly StubChatMessage[]
}>

export type StubModel = Readonly<{
  /** Base URL for `new OpenAIClient({ baseUrl })`, including the `/v1` prefix. */
  baseUrl: string
  requests: StubChatRequest[]
  close(): Promise<void>
}>

export type FakeDiscordGateway = Readonly<{
  gateway: DiscordGateway
  /** Every outbound message the adapter delivered, in order. */
  sent: { channelId: string; message: ChannelMessage }[]
  /** Every in-place message edit, which is how streaming replaces the placeholder. */
  edited: { channelId: string; messageId: string; message: ChannelMessage }[]
  readonly started: boolean
  /** Delivers one raw gateway event to the adapter, as the real client would. */
  emit(event: DiscordGatewayEvent): Promise<void>
}>

export function createFakeDiscordGateway(): FakeDiscordGateway {
  const handlers: DiscordGatewayHandler[] = []
  const sent: { channelId: string; message: ChannelMessage }[] = []
  const edited: { channelId: string; messageId: string; message: ChannelMessage }[] = []
  let started = false

  const gateway: DiscordGateway = {
    async start(handler) {
      started = true
      handlers.push(handler)
    },
    async stop() {
      started = false
    },
    async send(channelId, message): Promise<DiscordGatewaySentMessage> {
      sent.push({ channelId, message })
      return { id: `9000000000000000${sent.length}`, channelId }
    },
    async edit(channelId, messageId, message) {
      edited.push({ channelId, messageId, message })
    },
    async delete() {},
    async showTyping() {},
    async react() {},
    async unreact() {},
  }

  return {
    gateway,
    sent,
    edited,
    get started() {
      return started
    },
    /** Delivers one raw gateway event to the adapter, as the real client would. */
    async emit(event: DiscordGatewayEvent): Promise<void> {
      for (const handler of handlers) await handler(event)
    },
  }
}

export function discordDirectMessage(options: Readonly<{ id: string; content: string; authorId?: string }>): DiscordGatewayMessage {
  return {
    type: 'message',
    id: options.id,
    channelId: '800000000000000001',
    content: options.content,
    attachments: [],
    author: { id: options.authorId ?? '700000000000000001', username: 'customer', bot: false },
    bot: { id: '900000000000000001', username: 'golden-path', bot: true },
    direct: true,
    thread: false,
    system: false,
    mentionedBot: true,
  }
}

export type OtlpExport = Readonly<{
  path: string
  method: string
  authorization: string | undefined
  contentType: string | undefined
  body: Buffer
}>

export type OtlpReceiver = Readonly<{
  baseUrl: string
  exports: OtlpExport[]
  close(): Promise<void>
}>

export async function startOtlpReceiver(): Promise<OtlpReceiver> {
  const received: OtlpExport[] = []

  const server = createServer((request, response) => {
    void (async () => {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk as Buffer)
      received.push({
        path: request.url ?? '',
        method: request.method ?? '',
        authorization: request.headers.authorization,
        contentType: request.headers['content-type'],
        body: Buffer.concat(chunks),
      })
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end('{}')
    })()
  })

  await listen(server)
  const { port } = server.address() as AddressInfo

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    exports: received,
    close: () => closeServer(server),
  }
}

/**
 * Minimal OpenAI-compatible endpoint that answers deterministically: it asks for
 * `lookup_order` or `list_open_orders` when the prompt needs data, then answers
 * from the tool result. No network access and no API key are involved.
 */
export async function startStubModel(): Promise<StubModel> {
  const requests: StubChatRequest[] = []

  const server = createServer((request, response) => {
    void (async () => {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk as Buffer)
      const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as StubChatRequest
      requests.push(payload)

      if (payload.stream === true) {
        respondWithStream(response, payload)
        return
      }

      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(completionFor(payload, undefined)))
    })()
  })

  await listen(server)
  const { port } = server.address() as AddressInfo

  return {
    baseUrl: `http://127.0.0.1:${port}/v1`,
    requests,
    close: () => closeServer(server),
  }
}

function respondWithStream(response: ServerResponse, payload: StubChatRequest): void {
  response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const completion = completionFor(payload, undefined)
  const message = completion.choices[0]?.message

  sendChunk(response, { choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }] })
  if (message?.tool_calls !== undefined) {
    sendChunk(response, {
      choices: [
        {
          index: 0,
          delta: { tool_calls: message.tool_calls.map((call, index) => ({ index, ...call })) },
          finish_reason: null,
        },
      ],
    })
  } else {
    sendChunk(response, { choices: [{ index: 0, delta: { content: message?.content ?? '' }, finish_reason: null }] })
  }
  sendChunk(response, {
    choices: [{ index: 0, delta: {}, finish_reason: message?.tool_calls === undefined ? 'stop' : 'tool_calls' }],
  })
  sendChunk(response, { choices: [], usage: completion.usage })
  response.end('data: [DONE]\n\n')
}

function sendChunk(response: ServerResponse, chunk: Readonly<Record<string, unknown>>): void {
  response.write(`data: ${JSON.stringify({ id: 'chatcmpl-stub', object: 'chat.completion.chunk', created: 0, ...chunk })}\n\n`)
}

type StubCompletion = Readonly<{
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: readonly {
    index: number
    message: { role: 'assistant'; content: string | null; tool_calls?: readonly StubToolCall[] }
    finish_reason: 'stop' | 'tool_calls'
  }[]
  usage: Readonly<{ prompt_tokens: number; completion_tokens: number; total_tokens: number }>
}>

function completionFor(payload: StubChatRequest, model: string | undefined): StubCompletion {
  const toolResults = payload.messages.filter((message) => message.role === 'tool')
  const lastUser = [...payload.messages].reverse().find((message) => message.role === 'user')
  const prompt = lastUser?.content ?? ''

  if (toolResults.length === 0) {
    const orderId = /A-\d{4}/i.exec(prompt)?.[0]
    if (orderId !== undefined) {
      return asCompletion(toolCall('lookup_order', { orderId: orderId.toUpperCase() }), model)
    }
    if (/open orders?\b/i.test(prompt)) {
      return asCompletion(toolCall('list_open_orders', {}), model)
    }
  }

  return asCompletion(answerFrom(toolResults, prompt), model)
}

function toolCall(name: string, args: Readonly<Record<string, unknown>>): StubCompletion['choices'][number]['message'] {
  return {
    role: 'assistant',
    content: null,
    tool_calls: [{ id: `call_${name}`, type: 'function', function: { name, arguments: JSON.stringify(args) } }],
  }
}

function asCompletion(
  message: StubCompletion['choices'][number]['message'],
  model: string | undefined,
): StubCompletion {
  const toolCalls = message.tool_calls !== undefined
  return {
    id: 'chatcmpl-stub',
    object: 'chat.completion',
    created: 0,
    model: model ?? 'stub-model',
    choices: [
      {
        index: 0,
        message,
        finish_reason: toolCalls ? 'tool_calls' : 'stop',
      },
    ],
    usage: { prompt_tokens: 120, completion_tokens: 18, total_tokens: 138 },
  }
}

function answerFrom(
  toolResults: readonly StubChatMessage[],
  prompt: string,
): StubCompletion['choices'][number]['message'] {
  for (const result of toolResults) {
    let parsed: unknown
    try {
      parsed = JSON.parse(result.content ?? '')
    } catch {
      continue
    }
    if (typeof parsed !== 'object' || parsed === null) continue

    if ('orders' in parsed && Array.isArray(parsed.orders)) {
      const lines = parsed.orders.map((order: Readonly<{ orderId: string; status: string }>) =>
        `${order.orderId} (${order.status})`.trim(),
      )
      return { role: 'assistant', content: `Open orders: ${lines.join(', ')}.` }
    }

    if ('orderId' in parsed && typeof parsed.orderId === 'string') {
      const order = parsed as Readonly<{ orderId: string; status?: string; carrier?: string; eta?: string }>
      return {
        role: 'assistant',
        content: `Order ${order.orderId} is ${order.status ?? 'unknown'} with ${order.carrier ?? 'no carrier'}, ETA ${order.eta ?? 'unscheduled'}.`,
      }
    }
  }

  return { role: 'assistant', content: `No order data was needed for: ${prompt.slice(0, 60)}` }
}

async function listen(server: Server): Promise<void> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
}

async function closeServer(server: Server): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>()
  server.close((error) => (error === undefined ? resolve() : reject(error)))
  await promise
}

