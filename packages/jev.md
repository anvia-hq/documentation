# `@anvia/jev`

The Jev provider adapter supplies typed-decision models built on TypeSafe's official JavaScript SDK. It is useful for classification, tagging, routing, prioritization, record matching, and verification in ordinary applications, with answers that are typed labels, scores, and probabilities rather than free text.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.2.0` |
| Runtime | ESM, server-side JavaScript, Node.js 20 or newer |
| Peer | Matching `@anvia/core` release |

## Install

```bash
pnpm add @anvia/jev @anvia/core
```

## Make a decision

Set `TYPESAFE_API_KEY` in the server environment.

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'
import { choice, decide } from '@anvia/core/decision'

const client = new JevClient({ apiKey: process.env.TYPESAFE_API_KEY })
const model = client.decisionModel({ modelId: JEV_LATEST })

const { answers } = await decide({
  model,
  state: { message: 'Please refund my duplicate payment.' },
  questions: {
    department: choice({
      instructions: 'Which department should handle this?',
      options: {
        billing: 'Payments, invoices, and refunds',
        technical: 'Product bugs and technical support',
        general: 'Other requests',
      },
    }),
  },
})

console.log(answers.department.choice) // 'billing' | 'technical' | 'general'
console.log(answers.department.confidence)
```

## Capabilities

| Capability | Factory | Required selection |
| --- | --- | --- |
| Choice, rubric score, and boolean probability questions | `decisionModel({ modelId })` | Decision model ID |
| Multiple labels, composed from one question per label | `decisionModel({ modelId })` | Decision model ID |
| Model inventory | `listModels()` | Provider model list |

The package has no completion, embedding, OCR, or media factory. Decision operations (`decide`, `decideBatch`, and the question helpers) come from `@anvia/core/decision`, which the package builds on.

## Compatibility

`@anvia/jev` is ESM and uses the official `@typesafe-ai/sdk`. Supply `baseUrl` and `headers` for a custom endpoint, or inject a preconfigured `TypeSafeClient`. Core owns retries, cancellation, and batch execution; the adapter disables the SDK's own retries.

## Continue

- [Get started](/packages/jev/get-started)
- [Capabilities](/packages/jev/capabilities)
- [Configuration](/packages/jev/configuration)
- [API reference](/packages/jev/api-reference)
- [Releases](/packages/jev/releases)
- [Jev SDK guide](/sdk/providers/jev)
- [Typed decisions guide](/sdk/decisions)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-jev/CHANGELOG.md)
- [Official TypeSafe documentation](https://docs.typesafe.ai/)
