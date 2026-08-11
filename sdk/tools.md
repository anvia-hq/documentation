# Tools

Tools let an agent read data, call services, and take actions through contracts owned by your application.

## Explore tools

| Page | Learn how to |
| --- | --- |
| [Define a tool](/sdk/tools/define) | Describe model input, handler behavior, and typed output. |
| [Validation and execution](/sdk/tools/validation-and-execution) | Understand what Anvia validates and what the handler must enforce. |
| [Add tools to an agent](/sdk/tools/add-to-an-agent) | Give an agent the right tools and bound its tool loop. |
| [Tool results](/sdk/tools/results) | Return useful text, objects, rich content, and safe failures. |
| [Middleware](/sdk/tools/middleware) | Transform completion requests and tool input or output. |
| [Security](/sdk/tools/security) | Protect authorization, side effects, and private data. |

## The tool flow

When a model requests a tool, Anvia validates its arguments, calls the application handler, validates any declared output schema, and sends the result back as a tool message.

```text
Model request → input validation → handler → output validation → tool result
```

The schema defines the model-facing contract. The handler remains responsible for authorization, business rules, side effects, and redaction.

## A minimal tool

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const getWeather = createTool({
  name: 'get_weather',
  description: 'Get the current weather for a city.',
  input: z.object({
    city: z.string().min(1),
  }),
  async execute({ city }) {
    return weather.getCurrent(city)
  },
})
```

Use a direct [completion](/sdk/completions) when the application already knows which function to call. Use a tool when the model needs to choose an action or supply its arguments.
