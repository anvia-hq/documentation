# Anthropic capabilities

The completion handle returned by `completionModel({ modelId })` maps normalized messages, tools, media, and streams to the Anthropic Messages API.

It declares text completion, streaming, tools, tool choice, image input, file-document input, multimodal tool results, and reasoning content. It does not declare Core output schemas or provider-executed tools.

## 1. Stream a direct completion

```ts
import { streamCompletion } from '@anvia/core'

const events = streamCompletion({
    prompt: 'Explain this incident in three concise bullets.',
    model,
    maxTokens: 500
})

for await (const event of events) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log(
      '\nTokens:',
      event.result.usage.totalTokens,
    )
  }
}
```

Direct streams expose tool-call events but do not execute handlers. Use an [agent stream](/sdk/streaming/agent-streams) for execution and later turns.

## 2. Use local tools

```ts
const agent = new Agent({
  id: 'orders',
  model,
  instructions:
    'Use get_order for order questions. Never guess status.',
  tools: [getOrder],
  maxTurns: 4,
})
```

Anthropic tool use maps to normalized `tool_call` content. Tool results return as `tool_result` blocks, and streamed JSON arguments are assembled before execution.

Smoke test required tool choice and schema-valid streamed arguments against the exact model.

## 3. Send images and PDFs

```ts
import type { UserMessage } from '@anvia/core'

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize the issue shown in this report.' },
    { type: 'image', image: { type: 'url', url: signedScreenshotUrl } },
    {
      type: 'file',
      data: { type: 'url', url: signedReportUrl },
      mediaType: 'application/pdf',
      filename: 'incident.pdf',
    },
  ],
}

const result = await agent.generate({ messages: [prompt] })
```

Use short-lived signed URLs or bounded base64 input. The adapter rejects non-PDF file attachments. `documentText()` remains ordinary text.

Assistant-history image blocks are not supported on this adapter path. Store generated images and reintroduce them as authorized user input when needed.

## 4. Protect reasoning content

The adapter preserves Anthropic thinking, signatures, and redacted thinking blocks so valid history can continue across turns.

Reasoning is not ordinary response text. Do not render, persist, or trace it by default without explicit privacy and retention policy.

## 5. Extract structured data through tools

```ts
import { extract } from '@anvia/core/extractor'
import { z } from 'zod'

const incident = await extract({
  model,
  text: reportText,
  outputSchema: z.object({
    severity: z.enum(['low', 'medium', 'high']),
    summary: z.string(),
  }),
  instructions:
    'Extract only facts present in the incident report.',
  retries: { maxAttempts: 2 },
})

console.log(incident.output)
```

`extract()` requires the model to call its `submit` tool and validates the arguments. Test required-tool behavior for the exact model or compatible endpoint.

Next, configure [model options](/sdk/providers/anthropic/model-options).
