# Understand images

**Type:** Recipe

## Outcome

Send text and an image in one provider-neutral user message. Use this for descriptions, visual
question answering, or a first-pass review when the chosen model supports image input.

## Prerequisites

- `@anvia/core`, `@anvia/openai`, and a server-side `OPENAI_API_KEY`
- A completion model whose `capabilities.imageInput` is true
- An authorized, provider-reachable image URL

## Implementation

```ts
import { Agent } from '@anvia/core/agent'
import type { UserMessage } from '@anvia/core/completion'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})
if (!model.capabilities.imageInput) throw new Error('Selected model has no image input.')

const agent = new Agent({
  id: 'visual-reviewer',
  model: model,
  instructions: 'Describe only visible evidence. State uncertainty clearly.',
})

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Describe the scene in three bullets.' },
    {
      type: 'image',
      image: { type: 'url', url: 'https://example.com/authorized-image.jpg' },
      detail: 'auto',
    },
  ],
}

const response = await agent.generate({ messages: [prompt] })

if (response.status === 'completed') {
  console.log(response.output)
}
```

## Run and expected behavior

Replace the URL with an accessible image, save the file, and run it with `pnpm tsx`. The response
describes the visible content; wording and accuracy vary by model. An unsupported model is rejected
by the explicit capability check or request validation.

## Boundaries

Do not use visual output as proof of identity, authenticity, safety, diagnosis, or legal fact.
Validate URL schemes and hosts to prevent SSRF-style access, use short-lived signed URLs for private
assets, enforce size and media-type limits, and remove metadata when policy requires it.

In production, prefer bytes or controlled storage where supported, scan uploads, record user consent
and retention, evaluate representative images, and route important decisions to deterministic
checks or human review.

## Source and extensions

Run the
[image attachment cookbook](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/04_providers_and_multimodal/05-image-attachment.ts).
Next, compare URL and base64 inputs or combine the result with a validated structured schema.

- [Multimodal inputs](/sdk/advanced/multimodal/inputs)
- [Provider capabilities](/sdk/providers/capability-matrix)
