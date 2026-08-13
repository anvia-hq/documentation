# Capabilities

`AnthropicCompletionModel` is a streaming completion model. Anvia maps normalized messages and tools into Anthropic Messages API blocks, then maps responses back into Anvia content and stream events.

## Capability summary

| Capability | Support | Important boundary |
| --- | --- | --- |
| Text completion | Yes | Output is normalized assistant content. |
| Streaming | Yes | Text, reasoning, and tool-input deltas are preserved. |
| Tools and tool choice | Yes | The agent runtime executes local tools. |
| Image input | Yes | URLs and base64 images are accepted as user content. |
| Document input | Yes | Text documents become text; attachments must be PDFs. |
| Multimodal tool results | Yes | Text and base64 image results can return to Claude. |
| Reasoning content | Yes | Treat it as sensitive operational metadata. |
| Final output schema | No | Use a tool-backed extractor for structured data. |

Capability declarations describe the adapter. The exact Claude model and deployment must also support the request.

## Stream a completion

```ts
import { createCompletionStream } from '@anvia/core'

const events = createCompletionStream(model, {
  input: 'Explain this incident in three concise bullets.',
  maxTokens: 500,
})

for await (const event of events) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log('\nTokens:', event.response.usage.totalTokens)
  }
}
```

Direct completion streams expose tool-call events but do not execute tools. Use an [agent stream](/sdk/streaming/agent-streams) when the runtime should execute a tool and continue the conversation.

## Tools

Anthropic tool use maps to Anvia assistant `tool_call` content. Tool results return as Anthropic `tool_result` blocks, and streamed JSON arguments are assembled before an agent executes the handler.

```ts
const agent = new Agent({
  id: 'orders',
  model: model,
  instructions: 'Use get_order for order-specific questions. Never guess status.',
  maxTurns: 4,
  tools: [getOrder],
})
```

Add a provider smoke test for workflows that require a tool call. Verify that the handler receives complete, schema-valid arguments after streaming.

## Images and PDFs

```ts
import { Message, UserContent } from '@anvia/core'

const prompt = Message.user([
  UserContent.text('Summarize the issue shown in this report.'),
  UserContent.imageUrl(signedScreenshotUrl),
  UserContent.documentUrl(
    signedReportUrl,
    'application/pdf',
    { filename: 'incident.pdf' },
  ),
])

const response = await agent.prompt(prompt).send()
```

Use signed URLs with short lifetimes or bounded base64 inputs. The adapter rejects non-PDF document attachments. Text documents are sent as text instead.

Anthropic Messages does not support image blocks in assistant history through this adapter. Keep generated or previously returned images in application storage and reintroduce them as authorized user input when needed.

## Reasoning content

The adapter preserves Anthropic thinking, signatures, and redacted thinking blocks in normalized assistant history and stream events. This allows valid conversation history to continue across turns.

Reasoning is not ordinary response text. Do not render it in the product UI by default, and do not persist or trace it without an explicit privacy and retention policy.

## Structured data

The adapter declares `outputSchema: false`. For required structured output, use an Anvia extractor, which asks the model to call a required `submit` tool:

```ts
import { ExtractorBuilder } from '@anvia/core/extractor'
import { z } from 'zod'

const incidentExtractor = new ExtractorBuilder(
  model,
  z.object({
    severity: z.enum(['low', 'medium', 'high']),
    summary: z.string(),
  }),
)
  .instructions('Extract only facts present in the incident report.')
  .retries(1)
  .build()

const incident = await incidentExtractor.extract(reportText)
```

Required tool behavior can vary by model or compatible endpoint. Test the exact model before depending on extraction in production.
