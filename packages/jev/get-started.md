# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/jev
```

The official SDK it wraps requires Node.js 20 or newer. Create the client on the server:

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'
import { check, choice, decide } from '@anvia/core/decision'

const jev = new JevClient({ apiKey: process.env.TYPESAFE_API_KEY })
const model = jev.decisionModel({ modelId: JEV_LATEST })

const { answers } = await decide({
  model,
  state: { title: 'Wireless headphones with noise cancellation' },
  questions: {
    category: choice({
      instructions: 'Choose the product category.',
      options: { audio: 'Audio equipment', clothing: 'Clothes', other: 'Other products' },
    }),
    giftable: check({ instructions: 'Would this make a good gift?' }),
  },
})

console.log(answers.category.choice, answers.giftable.probability)
```

## Process many inputs

```ts
import { decideBatch } from '@anvia/core/decision'

const { items } = await decideBatch({
  model,
  inputs: titles.map((title) => ({ state: { title }, questions })),
  concurrency: 4,
  retries: { maxAttempts: 3 },
})
```

Each item reports `completed` with a result or `failed` with an error, in input order.

## Before production

- Keep `TYPESAFE_API_KEY` and the client server-side.
- Keep model IDs explicit and allowlisted.
- Remember that each multi-label option is an extra question and may increase billed usage.
- Choose action thresholds from labeled examples; probabilities are not calibrated.
- Enable retries deliberately and handle failed batch items.
