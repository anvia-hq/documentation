# How Studio works

Studio wraps registered Anvia runtime objects with a development HTTP runtime and browser console. It does not translate an agent into a separate Studio format, and it does not replace the agent execution engine.

## Runtime flow

```text
Agent or pipeline objects
          ↓
    new Studio(targets)
          ↓
Capability discovery + local stores + HTTP routes
          ↓
       Browser UI
          ↓
Real agent, tool, or pipeline execution
```

The browser is a client of the Studio process. Provider calls and tool execution remain on the server side, where the registered runtime objects and credentials live.

## 1. Register targets

The first constructor argument accepts Anvia agents and pipelines:

```ts
const studio = new Studio([
  supportAgent,
  researchAgent,
  ingestionPipeline,
])
```

Studio infers each target's ID, name, description, and runtime metadata. Passing an object does not copy its business data or credentials into the browser.

## 2. Discover capabilities

Studio reads the registered configuration and enables relevant surfaces automatically.

| Registered capability | Studio can expose |
| --- | --- |
| One or more agents | Playground and Agents. |
| Static or dynamic tools | Tool inventory and direct invocation. |
| Tools with `requiresApproval` | Interactive approval handling. |
| Context or dynamic tools | Knowledge inspection. |
| MCP-backed tools | MCP server and tool inspection. |
| Pipelines | Graph, runs, logs, history, and replay. |
| Agent memory or Studio sessions | Memory and session inspection. |
| Explicit sandbox inspectors | Read-only files, ports, and process inspection. |
| Registered sandbox views | Authorized browser desktops and human-control leases. |

Studio keeps every navigation item accessible so developers can discover the available inspection
surfaces. A page whose capability is not configured shows an empty or unavailable state instead of
disappearing from navigation. The registered targets still determine which pages contain data and
which actions can run.

## 3. Serve the console and API

`start()` creates the runtime and starts its Node.js HTTP server:

```ts
studio.start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

The same process serves:

- the browser console;
- configuration and status endpoints;
- session and trace storage routes;
- agent, tool, and pipeline execution routes;
- live session, pipeline, and trace events.

The default browser entry is `/playground`. The compatibility path `/ui/playground` redirects there when the default UI routing is enabled.

## 4. Execute the registered runtime

When the Playground starts a run, Studio resolves the selected agent and model, applies session context and runtime controls, then uses the normal Anvia `generate()` or `stream()` path.

Studio adds development behavior around that run:

- session persistence;
- transcript and run logs;
- tool approval and question responses;
- cancellation handling;
- local trace recording;
- realtime browser updates.

The agent still owns its instructions, tools, memory, context, lifecycle configuration, output schema, and turn limits.

## 5. Store local development state

By default, Studio creates an in-memory store for sessions, traces, pipeline logs, and pipeline runs.

| Default behavior | Consequence |
| --- | --- |
| No database file is created. | Setup is immediate. |
| State belongs to the Studio process. | Restarting clears sessions and run history. |
| Traces are local to Studio. | They are suited to development inspection, not durable operations. |

An explicit SQLite session store can preserve local state across restarts. Custom stores can also separate sessions, traces, pipeline logs, and pipeline runs when an integration needs more control.

## Lifecycle choices

Use `start()` for a conventional local entry point:

```ts
const studio = new Studio([agent]).start()
```

Call `close()` when another part of your program owns shutdown:

```ts
studio.close()
```

Use `serve()` when an abort signal or async cleanup needs to control the complete server lifecycle:

```ts
const shutdown = new AbortController()

process.once('SIGTERM', () => shutdown.abort())

await studio.serve({
  hostname: '127.0.0.1',
  port: 4021,
  signal: shutdown.signal,
  onShutdown: async () => {
    console.log('Studio stopped')
  },
})
```

`serve()` waits for shutdown, closes Studio in `finally`, and then runs `onShutdown`.

## Studio is not Lens

Studio traces explain runs made through the local Studio workflow. Lens collects durable application telemetry across development, staging, and production, then adds investigation and evaluation workflows around it.

Use both when useful: Studio for fast construction and debugging, and [Lens](/lens/) for operational history and release confidence.
