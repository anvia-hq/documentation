# Agents

The Agents view is the registry for every agent attached to the current Studio process. Use it to confirm that Studio loaded the expected agent and to review its model, runtime composition, and enabled capabilities before starting a Playground run.

Open `http://localhost:4021/ui/agents` when Studio is running on port `4021`.

## Register agents with Studio

Pass one or more agents to `Studio`:

```ts
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const supportAgent = new Agent({
  id: 'support-operations',
  model: client.completionModel('gpt-5.6-luna'),
  name: 'Support operations',
  description: 'Looks up tickets and prepares support actions.',
  maxTurns: 4,
})

new Studio([supportAgent]).start({ port: 4021 })
```

Each row uses the agent's stable `id` and displays its name and description when provided. Registering several agents adds them to the same Studio workspace; the **selected** badge identifies the agent currently shared by agent-aware views such as the Playground and Tools.

## Read the runtime summary

Studio asks the running server for a summary of each registered agent. The summary describes configuration, not the outcome of a particular run.

| Area | What Studio reports |
| --- | --- |
| Model | A readable provider/model identity when the model exposes one. |
| Tools | Registered static and dynamic tools. |
| MCP | The subset of registered tools carrying MCP server provenance. |
| Context | Static context plus dynamic context registrations. |
| Observers | Observers attached to the agent. |
| Prompts | Quick prompts configured for this agent in Studio. |
| Memory | Whether the agent has a memory implementation. |
| Hook | Whether the agent has a prompt hook. |
| Schema | Whether the agent requires structured output. |
| Turns | The configured default maximum number of turns, when set. |

The counts are intentionally compact. For example, **context 3** means the agent has three static and dynamic context registrations in total; it does not mean that all three were retrieved for the latest prompt.

Likewise, an MCP count is provenance, not an additional tool set. MCP tools participate in the agent's registered tools and are identified separately so you can see which capabilities come from connected servers.

## What the view does not show

The Agents view is an inventory surface. It does not expose full instructions, context documents, memory records, tool arguments, or previous responses.

Use the more focused Studio views for those questions:

- [Tools](/studio/tools) shows tool definitions, origins, schemas, and approval metadata.
- [Playground](/studio/playground) runs the agent and streams its tool activity.
- [Pipelines](/studio/pipelines) inspects registered workflows rather than agents.

If a row says **Runtime unavailable** or **Waiting for summary**, the browser could not load that agent's runtime endpoint. Confirm that the Studio process is still running and that the agent remains registered under the displayed ID.

## Interpret capabilities carefully

A capability badge tells you that the agent is configured to use that facility. It is not a health check for an external provider, database, MCP server, or vector store. Run a representative prompt—or invoke a safe tool directly—to verify behavior against real dependencies.

Continue to [Tools](/studio/tools) to inspect the capabilities behind the tool count.
