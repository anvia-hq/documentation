# Security boundaries

Studio is a trusted local development console. It can run registered agents, invoke tools and pipelines, inspect prompts and results, and expose information held by the same process. Do not publish it directly to an untrusted network.

## Bind Studio deliberately

Use an explicit loopback address:

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

new Studio([supportAgent]).start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

Studio does not provide built-in user authentication, authorization, or TLS. If remote access is unavoidable, place the entire Studio origin behind trusted network controls, TLS, and authentication—not just the HTML page.

## `protectShell` is not authentication

The `ui.protectShell` option currently follows the same shell-registration path whether it is `true` or `false`. It does not verify a user, protect API routes, or create an authorization boundary.

Likewise:

- `ui: false` removes the browser shell but leaves runtime API routes active;
- `rootRoutes: false` changes console routing but does not secure the API;
- `redirectRoot: false` only removes the root redirect.

Treat routing options as presentation controls, not security controls.

## Understand what a connected user can do

A person who can reach Studio may be able to:

- send prompts using your provider credentials;
- invoke registered tools directly with schema-validated arguments;
- approve tool calls and answer runtime questions;
- run pipelines and replay stored pipeline inputs;
- read sessions, messages, logs, traces, tool results, and model metadata;
- inspect registered MCP servers and sandbox resources.

Tool approval reduces accidental execution during an agent run, but it is not access control for the Studio server. Direct tool and pipeline surfaces should be treated as privileged developer capabilities.

## Limit credentials and tool authority

Run Studio with development credentials and the least authority needed for the task. Prefer test accounts, non-production databases, scoped API tokens, and sandboxed filesystems.

Provider keys stay in the server process rather than being configured in the browser. However, prompts, outputs, trace payloads, errors, and logs returned to the browser can still contain sensitive information. Avoid placing secrets in prompts or tool results, and review what custom observers and tools record.

## Treat custom UI code as trusted code

`ui.clientScript` executes JavaScript in the Studio origin. Only supply code you control. A custom client has the same browser access to Studio APIs as the bundled console.

## Keep sandbox ownership explicit

The sandbox inspector's HTTP routes are read-only, but agents can still use the sandbox tools you register. Those tools may read or write files, execute allowed commands, and expose published ports according to their own configuration.

Restrict sandbox networks, commands, file sizes, process counts, and timeouts. Destroy ephemeral sessions in `serve({ onShutdown })`; Studio does not destroy them automatically. See [Lifecycle and cleanup](/studio/configure/lifecycle-and-cleanup).

## Protect stored development data

SQLite files can contain complete conversation and trace data. Keep them out of source control, apply appropriate filesystem permissions, and remove them when the investigation is finished. See [Storage and persistence](/studio/configure/storage-and-persistence).

For production observability, use [Lens](/lens/) with its intended deployment and access controls rather than exposing Studio as an operational dashboard.

