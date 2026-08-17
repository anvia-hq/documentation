# Tool results

Tool results become model-readable messages. Return only what the next model turn needs to continue correctly.

## Return text

Use text for a simple fact, status, or summary.

```ts
const checkOrderStatus = createTool({
  name: 'check_order_status',
  description: 'Check the current status of one order.',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.string(),
  async execute({ orderId }) {
    const order = await orders.get(orderId)
    return `Order ${order.id} is ${order.status}.`
  },
})
```

## Return a structured object

Use an output schema when the result also needs a stable application shape.

```ts
const searchOrders = createTool({
  name: 'search_orders',
  description: 'Find recent orders for the current user.',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({
    matches: z.array(z.object({
      id: z.string(),
      status: z.string(),
    })),
  }),
  async execute({ query }) {
    return {
      matches: await orders.search({ userId: user.id, query }),
    }
  },
})
```

Return a purpose-built object rather than a raw database row.

## Return rich content

Use `ToolOutput.content(...)` only when the selected model and product surface support structured tool content such as an image.

```ts
import { ToolOutput, createTool } from '@anvia/core/tool'

const renderChart = createTool({
  name: 'render_chart',
  description: 'Render a chart image for a metric.',
  inputSchema: z.object({ metricId: z.string() }),
  async execute({ metricId }) {
    const chart = await charts.render(metricId)

    return ToolOutput.content([
      { type: 'text', text: `Rendered chart for ${metricId}.` },
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

## Keep results safe

Return safe text for expected misses and throw unexpected failures. Redact secrets, payment details, internal notes, and customer data before they reach the model or a browser stream.
