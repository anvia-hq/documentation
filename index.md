# Introduction

Anvia is a TypeScript runtime and product suite for building, debugging, and operating AI agents
inside your own application. You create the provider model and define the agent's behavior; Anvia
runs the model and tool loop, while your application keeps authentication, data, persistence, and
deployment.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const agent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly. Ask for missing details.',
})

const response = await agent.generate({ prompt: 'How do I reset my password?' })
if (response.type === 'response') console.log(response.output)
```

## Start here

- [Add Anvia to your coding agent](/guide/coding-agents): Install Agent Skills for Claude Code, Cursor, or Codex.
- [Quickstart](/guide/getting-started): Install a provider, verify a completion, and run your first agent.
- [What is an agent runtime?](/guide/introduction): See what Anvia owns and what stays in your application.

## Products

| Product | What it does |
| --- | --- |
| [Anvia SDK](/sdk/) | Provider-neutral models, agents, tools, memory, retrieval, pipelines, durable execution, and streaming. |
| [Channels](/channels/) | Connect agents to Discord, Slack, and Telegram, including proactive delivery. |
| [Studio](/studio/) | A local browser runtime for running agents and inspecting sessions, traces, tools, and memory while you develop. |
| [Lens](/lens/) | Production tracing, evaluations, datasets, alerts, and cost for the systems you ship. |
| [CLI](/packages/cli) | Install coding-agent skills and editable React chat components. |

## Features

- [Agent Runtime](/features/agent-runtime): Reusable agents with bounded model and tool turns.
- [Agent API and Interfaces](/features/agent-api): Serve agents over HTTP and render them in React.
- [Tools and MCP](/features/tools-and-mcp): Typed application actions, tool search, and MCP servers.
- [Knowledge and RAG](/features/knowledge-and-rag): Embeddings, vector stores, and GraphRAG.
- [Memory](/features/memory): Durable session history in your own database.
- [Multi-agent Teams](/features/multi-agent): Coordinate specialist agents.
- [Durable Execution](/features/durable-execution): Runs that survive restarts and resume after approvals.
- [Security and Auth](/features/security): Keep authorization, secrets, and limits on the server.
- [Observability](/features/observability) and [Evaluations](/features/evaluations): Trace, score, and compare releases.

## LLM-ready docs

Point a coding agent or LLM at plain-text guides instead of HTML pages. Start with the index, then
load only the topic guide the task needs.

- [llms.txt](/llms.txt): Index of the documentation, stable v1 boundaries, and topic guides.
- [Agents, tools, and MCP](/llms-agents.txt): Models, agents, tools, MCP, skills, memory, agent teams, pipelines versus durable workflows, sandboxing, and streaming.
- [Full-stack applications](/llms-apps.txt): Server streaming, React client state, headless UI, interactions, resumption, durable chat, authentication, cancellation, and Discord/Slack/Telegram channels.
- [Evaluations and observability](/llms-evals.txt): Tracing, Lens setup, runtime scoring, evaluation suites, datasets, release comparison, and quality gates.
- [RAG and retrieval](/llms-rag.txt): Vector indexes, vector stores, embeddings, metadata filters, GraphRAG, dynamic context, and permission-aware retrieval.

## What's new

Anvia packages release independently. Read the [changelog](/packages/changelog) for recent
additions, and [Compatibility and versioning](/packages/compatibility-and-versioning) for supported
versions and the [v0 to v1 migration boundary](/packages/compatibility-and-versioning#v0-to-v1-migration-boundary).
