# Security and auth

A production Anvia service keeps the runtime boundary explicit: the server authenticates users, constructs trusted dependencies, runs bounded agents, and emits only the events a client is allowed to receive.

## Validate configuration at startup

Anvia clients receive credentials explicitly. Validate them once during server startup rather than discovering a missing secret during a user request.

```ts
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: 'responses'
})
```

Keep provider keys, database credentials, and observability secrets in the server configuration layer. Never send them to a browser or place them in client-visible errors.

## Authenticate before agent execution

Authentication belongs at the request boundary. Tool handlers must also enforce authorization because schema validation only proves that arguments have the expected shape.

`authenticate()` and `runSupportAgent()` below stand for your application's own authentication and request handling.

```ts
export async function POST(request: Request) {
  const user = await authenticate(request)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  return runSupportAgent({ user, input: body.input })
}
```

Do not treat a session ID, user ID, tenant ID, or model-selected tool argument as proof of access.

## Bind private tools to the request

Create tool handlers around authenticated application services. The closure keeps trusted identity out of model-controlled arguments.

```ts
import { Agent, createTool } from '@anvia/core'
import { z } from 'zod'

function createOrderTools(userId: string) {
  return [
    createTool({
      name: 'lookup_order',
      description: 'Look up an order the current user may access.',
      inputSchema: z.object({ orderId: z.string() }),
      handler: async ({ orderId }) => {
        return orders.findAuthorized({ orderId, userId })
      },
    }),
  ]
}

const agent = new Agent({
  id: 'support',
  model,
  tools: createOrderTools(user.id),
})
```

`orders` is an application service and `user` comes from the authenticated request. Use approval requirements for consequential side effects, but keep product authorization inside the handler even after a user approves the action.

## Bound every run

Set a safe default on the agent and tighten it for flows that need less work. Tool-assisted runs need enough turns for a request, tool result, and final answer.

```ts
const agent = new Agent({
  id: 'support',
  model,
  maxTurns: 6,
})

const response = await agent.generate({
    prompt: input,
    maxTurns: 3
})

if (response.type === 'interaction') {
  return queueInteraction({
    interaction: response.interaction,
    continuation: response.continuation,
  })
}
```

Also enforce request timeouts, body-size limits, model token limits, tool concurrency, and upstream rate limits at the application boundary.

## Scope durable memory

Create sessions from authenticated, stable identifiers. The memory store uses the session context to load and append history; changing the scope points to a different conversation.

```ts
const session = { sessionId: threadId, userId: user.id, metadata: {
        tenantId: user.tenantId,
    } };
const response = await memoryAgent.generate({
    prompt: input,
    session: session
});
```

Verify that the authenticated user can access `threadId` before creating the session. Browser state is only a view of memory—the server remains the source of truth.

## Stream from the server

Return normalized runtime events with `@anvia/server`. JSONL is the default for Anvia clients; SSE supports clients that require `text/event-stream`.

```ts
import { agentToClientStream } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'

const events = agent.stream({ messages })
return createClientStreamResponse({
  events: agentToClientStream({ events }),
  format: 'jsonl',
})
```

Handle disconnects and `error` events at the application boundary. Redact internal errors before sending them to clients, and never expose provider request payloads by default.

## Observe conservatively

Record lifecycle state, failures, usage, run IDs, and trace metadata. Treat prompts, model payloads, final output, tool arguments, and tool results as potentially sensitive.

```ts
if (event.type === 'response' || event.type === 'interaction' || event.type === 'blocked') {
  metrics.recordUsage({
    runId: event.runId,
    totalTokens: event.usage.totalTokens,
  })
}
```

Only retain message content when a documented product or compliance policy requires it.

## Always clean up sandboxes

Destroy sandbox handles even when model execution or a tool fails. `sandboxClient` is a sandbox client such as `DockerSandboxClient` from `@anvia/sandbox`, and `runWithSandbox()` is your application's work; see [Sandbox](/sdk/advanced/sandbox) for setup.

```ts
const sandbox = await sandboxClient.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  runtime: { commandTimeoutMs: 20_000 },
})

try {
  return await runWithSandbox(sandbox.runtime)
} finally {
  await sandbox.destroy()
}
```

Start with explicit command allowlists, timeouts, output limits, file-size limits, and disabled networking. Expand them only for a demonstrated product requirement.

## Production checklist

- Install package versions whose declared dependency and peer-dependency ranges are compatible.
- Validate secrets during startup and keep them server-only.
- Authenticate requests before constructing sessions or request-scoped agents.
- Authorize every private read and side effect inside tool execution.
- Bound turns, tokens, concurrency, time, request size, and retries.
- Handle approvals, disconnects, stream errors, and cleanup paths explicitly.
- Minimize sensitive logging and define retention before enabling payload capture.
