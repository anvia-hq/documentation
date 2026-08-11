# Multimodal tool results

A tool can return text and image content together. The agent runtime preserves that structured result and sends it into the next model turn when the selected provider supports image tool results.

Use this when the model must inspect an image created or loaded by a tool—for example a rendered chart, a screenshot, or a cropped document region. Ordinary operational tools should continue returning small objects or text.

## Return text and an image

```ts
import { ToolOutput, createTool } from '@anvia/core/tool'
import { z } from 'zod'

const renderChart = createTool({
  name: 'render_chart',
  description: 'Render a chart for an authorized product metric.',
  input: z.object({
    metricId: z.string(),
  }),
  async execute({ metricId }) {
    const chart = await charts.render(metricId)

    return ToolOutput.content([
      {
        type: 'text',
        text: `Rendered the chart for ${metricId}.`,
      },
      {
        type: 'image',
        data: chart.base64Png,
        mediaType: 'image/png',
      },
    ])
  },
})
```

Image tool content uses raw base64 data, not a `data:` URL. `ToolOutput.content(...)` makes the structured result explicit while retaining a display-safe text representation for hooks, observers, stream events, and transcript surfaces.

## Check the complete path

Support is required at more than one layer:

```text
Tool result → agent runtime → provider adapter → selected model → product UI
```

If a provider path is text-only, the model receives a media-type placeholder instead of raw base64. Smoke test the exact provider adapter and model ID before depending on visual inspection. The UI must also decide whether the image is safe and useful to display; a model-readable result is not automatically user-visible.

## Keep results bounded

Inline image content is copied through runtime and provider requests. Resize or crop an image to the smallest useful representation, reject unsupported media types, and avoid putting secrets into screenshots.

For large files, persist the asset in application-owned storage and return a concise text result with its stable asset ID. Only include image content when the next model turn genuinely needs the pixels. Authorization belongs in the tool or the service it calls, not in the tool description.
