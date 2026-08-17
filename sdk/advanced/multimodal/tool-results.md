# Multimodal tool results

A tool can return text and image file content together. Use this only when the next model turn genuinely needs the pixels.

## 1. Return text and an image

```ts
import { ToolOutput, createTool } from '@anvia/core/tool'
import { z } from 'zod'

const renderChart = createTool({
  name: 'render_chart',
  description:
    'Render a chart for an authorized product metric.',
  inputSchema: z.object({
    metricId: z.string(),
  }),
  async execute({ metricId }) {
    const chart = await charts.render(metricId)

    return ToolOutput.content([
      {
        type: 'text',
        text: `Rendered chart ${metricId}.`,
      },
      {
        type: 'file',
        data: { type: 'data', data: chart.base64Png },
        mediaType: 'image/png',
        filename: `${metricId}.png`,
      },
    ])
  },
})
```

File content with `data.type: 'data'` uses raw base64 without a `data:` URL prefix. `ToolOutput.content()` marks the array as structured tool-result content instead of serializing it as an ordinary object.

## 2. Understand runtime representations

The next transcript message retains the structured text and file parts. Stream events expose a text display form such as `Rendered chart metric_1\n[file:image/png]` and may also include `structuredResult`.

Middleware can inspect or replace ordinary tool output. Project only approved fields into product-facing events and traces.

## 3. Verify the provider adapter

```text
Tool result -> agent runtime -> provider adapter -> model
```

Some adapters preserve image tool results as model-readable image input. Text-only adapter paths replace an image with a media-type placeholder. Smoke test the exact adapter and model ID before depending on visual inspection.

The model must also advertise image-input support or Anvia rejects the completion request with `CompletionCapabilityError`.

## 4. Keep inline media bounded

Resize or crop to the smallest useful representation. Reject unsupported media types and keep secrets out of screenshots.

For large files, store the asset and return a concise text result with its stable ID. Authorization belongs in the tool handler or called service, not in the description.

Next, compose [multimodal pipelines](/sdk/advanced/multimodal/pipelines).
