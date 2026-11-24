# Studio

Anvia Studio (`@anvia/studio`) is a local browser console for running and debugging the agents, pipelines, and knowledge graphs your application already builds. Register the real runtime objects, then inspect each run without writing a temporary interface or test harness.

## When to use it

- You are changing an agent's instructions, tools, or model and want to run prompts and review the result immediately.
- You need to inspect a tool's schema or invoke it directly with validated arguments.
- You want to follow the model generations and tool calls behind one development session.
- You need to see what context, retrieval evidence, memory, or MCP tools an agent actually receives.
- You want to run a pipeline, read its logs, and replay saved input.

## How it works

Pass constructed agents and built pipelines to `Studio`, then start it from a separate development entry point:

```ts
import 'dotenv/config'
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })

const agent = new Agent({
  id: 'support',
  model: client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' }),
  name: 'Support',
  description: 'Answers product support questions.',
  instructions: 'Answer clearly. Ask for missing details before making assumptions.',
})

new Studio([agent]).start({ hostname: '127.0.0.1', port: 4021 })
```

Open `http://127.0.0.1:4021/playground`. Studio discovers capabilities from what you register and fills the matching views: Playground, Agents, Tools, Traces, Pipelines, Graphs, Knowledge, Memory, MCPs, sandboxes, and Status. Eval suites passed through the `evals` option are exposed by the runtime as well.

These views are not mocked. A Playground run calls the registered agent through its normal `generate()` or `stream()` path, tool invocation uses the registered tool, and provider calls stay in the Node.js process.

## Studio data is not Lens telemetry

Studio stores sessions, local traces, pipeline logs, and pipeline runs for the development console. They are kept in memory by default and disappear on restart; `createSqliteSessionStore()` keeps them in a local SQLite file. These traces describe runs made through Studio only.

[Lens](/lens/) receives telemetry that your application exports from any environment, retains it, and adds investigation, evaluation, and release comparison. Use Studio while building the agent and Lens to observe the deployed application.

## What your application owns

- **Access control**: Studio executes agents, tools, and pipelines with the credentials and permissions of its process. Bind it to a loopback address and do not expose it to an untrusted network. `protectShell` is not authentication.
- **Secrets**: provider keys stay in the server process's environment; the browser never needs them.
- **Entry point**: keep the Studio entry point separate from production startup so the console is not started in production.
- **Persistence and cleanup**: choose the stores, close an application-owned SQLite store during shutdown, and clean up any sandboxes you register.

## Go deeper

- [Anvia Studio](/studio/): surfaces and where Studio fits next to Lens
- [Install and setup](/studio/install-and-setup): add Studio to a project and create an entry point
- [Run your first agent](/studio/run-your-first-agent): register an agent and inspect a real run
- [How Studio works](/studio/how-studio-works): targets, discovery, execution, storage, and lifecycle
- [Playground](/studio/playground), [Tools](/studio/tools), [Traces](/studio/traces): run, invoke, and inspect
- [Knowledge](/studio/knowledge), [Memory](/studio/memory), [Pipelines](/studio/pipelines), [MCP](/studio/mcp): runtime inspection views
- [Storage and persistence](/studio/configure/storage-and-persistence): in-memory and SQLite stores
- [Security boundaries](/studio/configure/security-boundaries): what Studio can reach and how to contain it
- [`@anvia/studio` package](/packages/studio): installation and public API
