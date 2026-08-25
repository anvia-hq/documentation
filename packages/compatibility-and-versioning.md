# Compatibility and versioning

Anvia v1 packages version and publish independently. A Studio, provider, integration, or adapter
release does not force unrelated packages onto the same version. Applications may combine package
versions when their declared dependency and peer-dependency ranges are compatible.

## Check three boundaries

Before upgrading, verify:

1. The package's `peerDependencies` accepts your `@anvia/core` version.
2. The package's runtime and peer requirements match your application.
3. Its changelog contains no migration note that affects your configuration or stored data.

Package pages summarize these boundaries, while the package manifest remains the source of truth for exact dependency ranges.

## Stable versions

Each package publishes stable releases through its own npm `latest` tag. As of the current
documentation baseline, Core is `1.0.3`, Studio is `1.0.5`, and the graph packages are `1.0.4`;
other packages can have different versions. Check the package's release page or npm metadata rather
than assuming one repository-wide version.

Pin exact versions in production environments when upgrades require deliberate review.

```json
{
  "dependencies": {
    "@anvia/core": "1.0.3",
    "@anvia/openai": "1.0.3",
    "@anvia/studio": "1.0.5"
  }
}
```

Use your workspace's preferred lockfile and update packages intentionally rather than accepting an
unreviewed range change. An internal dependency-only patch can advance an adapter even when its own
public behavior did not change.

## Runtime compatibility

Some adapters require a specific Node.js version, browser runtime, native dependency, database extension, or external service. These constraints differ by package. In particular:

- UI packages require compatible React versions.
- local embedding packages may download models or load native/WASM runtimes;
- database and vector adapters require compatible client libraries and schemas;
- `@anvia/sandbox` requires a supported Docker environment;
- `@anvia/browser` requires Docker, a compatible browser image, and Playwright-compatible Chromium;
- `@anvia/neo4j` requires Neo4j 2026.01 or newer and matching vector dimensions;
- `@anvia/memgraph` requires Memgraph 3.6 or newer and matching vector dimensions;
- `@anvia/mcp` requires Node.js 20 or newer and MCP protocol `2026-07-28`;
- `@anvia/cli` requires Node.js 20.18.1 or newer and an existing Next.js or Vite application;
- Core PDF extraction requires the application to install the optional `pdfjs-dist` peer;
- observability adapters require credentials and network access to their backend.

## Public API boundary

Only manifest exports are supported package entry points. Avoid imports from `src`, `dist`, or an unlisted subpath. TypeScript accepting an internal path does not make it part of the compatibility contract.

```ts
// Public
import { Agent } from '@anvia/core'
import type { Message } from '@anvia/core/completion'

// Internal and unsupported
// import { something } from '@anvia/core/dist/internal-file.js'
```

## v0 to v1 migration boundary

The v1 API uses declarative `new Agent({...})` construction and direct `agent.generate(...)` or `agent.stream(...)` runs. Builder-era APIs such as `AgentBuilder`, prompt requests, and `.send()` are not part of the v1 public surface.

Anvia `1.0.0` includes the final v1 migration boundary:

- import MCP clients and transports from `@anvia/mcp`; Core retains registration contracts only;
- verify MCP servers support protocol `2026-07-28` because there is no legacy fallback;
- install `pdfjs-dist` only in applications that call `extractPdfText()`;
- rename React UI compound namespaces to `*Primitive`, remove package CSS imports, and move styling
  into application code or generated `@anvia/cli` components.

When moving from v0 to v1, select mutually compatible Core and adapter versions, then follow the
[v1 Core API reference](/packages/core/api-reference) and provider-specific configuration pages.

## Upgrade checklist

- Read the relevant entry in [Changelog](/packages/changelog).
- Check declared internal dependency and peer-dependency ranges; do not infer compatibility from
  equal or unequal version numbers alone.
- Compare public types used by your application.
- Run TypeScript, unit, integration, and evaluation suites.
- Test migrations against a copy of production data.
- Confirm traces, usage, tool calls, and streaming events still arrive as expected.
