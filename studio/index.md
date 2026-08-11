# Anvia Studio

Anvia Studio is a local browser console for building, running, and debugging Anvia agents and pipelines. Point it at the same runtime objects your application uses, then inspect their behavior without building a temporary interface or test harness.

Studio is designed for the development loop:

```text
Run a prompt → inspect the response → review tools and traces → adjust the agent → run again
```

## What Studio gives you

Studio discovers capabilities from the agents and pipelines you register. The browser can then expose the surfaces that apply to them.

| Surface | What it helps you do |
| --- | --- |
| Playground | Stream a real agent run and keep related prompts in a session. |
| Agents | Verify identity, model, tools, context, memory, hooks, and runtime limits. |
| Tools | Inspect schemas and invoke a tool directly with validated arguments. |
| Traces | Follow model generations and tool calls for a Studio session. |
| Pipelines | Read a pipeline graph, run it, inspect logs, and replay saved input. |
| Knowledge | Inspect registered context, dynamic tools, and retrieval evidence. |
| Memory | Explore users, conversations, messages, and recorded run steps. |
| MCPs and sandboxes | Inspect connected MCP tools and active sandbox resources. |
| Status | Check registered targets, storage adapters, and enabled capabilities. |

These are not mocked representations. Playground runs call the registered agent, tool execution uses the registered tool, and pipeline runs use the registered pipeline.

## Where Studio fits

Studio and Lens answer different questions.

| Studio | Lens |
| --- | --- |
| Build and debug agents locally. | Observe applications across environments. |
| Run prompts, tools, and pipelines interactively. | Investigate production traces, users, sessions, cost, and failures. |
| Keep rapid development feedback close to the code. | Retain telemetry and evaluate behavior over time. |
| Starts with runtime objects in the current process. | Starts with telemetry exported by an application. |

Use Studio while changing the agent. Use [Lens](/lens/) when the application needs durable observability, evaluation workflows, and operational investigation.

## Start here

| Page | What you will do |
| --- | --- |
| [Install and setup](/studio/install-and-setup) | Add Studio to an Anvia project and prepare a local entry point. |
| [Run your first agent](/studio/run-your-first-agent) | Register an agent, open the Playground, and inspect a real run. |
| [How Studio works](/studio/how-studio-works) | Understand targets, discovery, execution, storage, and lifecycle. |

## Development boundary

Studio can execute agents, tools, and pipelines with the credentials and permissions of its process. Treat it as a trusted developer surface: bind it to a loopback address, keep provider keys on the server, and do not expose it directly to an untrusted network.

Start with [Install and setup](/studio/install-and-setup).
