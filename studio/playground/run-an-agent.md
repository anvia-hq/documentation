# Run an agent

Register an existing Anvia agent with Studio, open the Playground, and send a prompt. Studio uses the agent as configured; you do not need a separate development-only agent implementation.

## Register the agent

This example gives the agent one local tool so the transcript has useful activity to inspect:

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createTool } from '@anvia/core/tool'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'
import { z } from 'zod'

const client = new OpenAIClient({
  baseUrl: process.env.OPENAI_BASEURL,
  apiKey: process.env.OPENAI_API_KEY,
})

const getOrder = createTool({
  name: 'get_order',
  description: 'Read an order summary from local application state.',
  input: z.object({
    id: z.string().describe('The order ID to read.'),
  }),
  output: z.object({
    id: z.string(),
    status: z.enum(['processing', 'blocked', 'shipped']),
    customer: z.string(),
    notes: z.string(),
  }),
  execute: ({ id }) => ({
    id,
    status: 'blocked' as const,
    customer: 'Delta Kit Labs',
    notes: 'Warehouse allocation has not been confirmed.',
  }),
})

const agent = new AgentBuilder(
  'support-operations',
  client.completionModel('gpt-5.6-luna'),
)
  .name('Support Operations')
  .description('Answers operational questions with concise summaries.')
  .instructions('Use tools when useful. Keep answers action-oriented.')
  .tool(getOrder)
  .defaultMaxTurns(5)
  .build()

new Studio([agent], {
  quickPrompts: {
    'support-operations': [
      'Check order ORD-104 and summarize what is blocking it.',
    ],
  },
}).start({ port: 4021 })
```

`quickPrompts` is keyed by agent ID. Its prompts appear only on an empty Playground transcript and run immediately when selected.

## Open the Playground

Start the file with your project’s TypeScript runner, then open:

```txt
http://localhost:4021/ui/playground
```

Select the quick prompt or enter:

```txt
Check order ORD-104 and explain what should happen next.
```

The transcript should show this sequence:

1. Your prompt appears immediately.
2. Assistant text or reasoning streams as the model produces it.
3. The `get_order` tool entry shows its arguments and then its result.
4. The assistant response completes with its duration and any available token metrics.
5. When tracing is available, the response footer links directly to the completed trace.

The exact wording and tool-call order remain model-dependent. Inspect the tool entry to verify the agent used application data instead of judging the run only by its prose.

## Continue the conversation

The first prompt creates a Studio session automatically. Follow-up prompts in the same chat send the session ID, allowing the runtime to continue with the stored conversation.

Choosing **New chat** starts a fresh session. Selecting another agent also clears the current transcript because a Studio session belongs to one agent.

By default, sessions are held in memory. Restarting the process clears them unless you configure a persistent session store.

## Stop a run

While Studio is receiving the JSONL event stream, the send button becomes **Stop generating**. Select it when a run is no longer useful.

Stopping does three things:

- aborts the browser’s active stream;
- asks the runtime to cancel the unfinished run;
- records the current session run as cancelled, including any partial transcript.

Pending approvals and human questions are cancelled as part of the same operation, so they cannot leave a tool waiting after the user stops the run. Model providers and external tools may have already performed work before cancellation reaches them; cancellation should not be treated as a rollback.

Next, configure [models and attachments](/studio/playground/models-and-attachments), or add [approvals and questions](/studio/playground/approvals-and-questions) to runs that need operator input.

