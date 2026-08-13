# Anvia SDK

Build provider-neutral AI behavior inside a TypeScript application. Anvia supplies small runtime primitives and lets your application keep ownership of credentials, permissions, data, persistence, and deployment.

## Choose the runtime shape

| Primitive | Use it when | What Anvia handles |
| --- | --- | --- |
| Completion | Your application owns a single model call. | Normalized requests, responses, usage, and streaming. |
| Agent | A model-driven task needs reusable instructions, tools, memory, or multiple turns. | Context assembly, the model/tool loop, sessions, events, and run limits. |
| Extractor | Unstructured input must become validated application data. | Schema-driven model output and parsing. |
| Pipeline | Work must follow repeatable stages, branches, or parallel steps. | Typed workflow execution across models, agents, and functions. |

## Add only what the product needs

| Area | Capabilities |
| --- | --- |
| Models and actions | Provider models, typed tools, MCP tools, skills, and multimodal generation. |
| State and knowledge | Sessions, durable memory, static context, loaders, embeddings, and vector retrieval. |
| Control and safety | Turn limits, hooks, middleware, approvals, schemas, and guardrails. |
| Operations | Runtime events, observers, evaluations, server streams, React state, and Studio. |

These capabilities attach to the runtime shape you chose. You do not need a different framework when an agent later gains memory or when a pipeline needs observability.

## Run your first agent

```bash
pnpm add @anvia/core @anvia/openai
```

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const agent = new Agent({
  id: 'support',
  model: client.completionModel('gpt-5'),
  instructions: 'Answer support questions clearly.',
  maxTurns: 4,
})

const response = await agent.prompt('Draft a reply to this ticket.').send()
console.log(response.output)
```

## From runtime to product

Keep the agent on the server, expose its events with `@anvia/server`, consume them with `@anvia/react`, and attach observers for logs or traces. Use Studio while developing when you need to inspect prompts, sessions, tools, memory, and runtime events.

The runtime remains dependency-injection oriented throughout: your application constructs provider models, stores, indexes, services, tools, and observers, then passes them into Anvia.

## Where to start

- [Install the runtime and a provider](/sdk/install-and-setup).
- [Build your first agent](/sdk/your-first-agent).
- [Learn the runtime lifecycle](/sdk/agents/runtime-lifecycle).
- [Review tool security before shipping](/sdk/tools/security#before-shipping).
