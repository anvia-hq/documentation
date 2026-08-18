# Compatibility and versioning

The v1 release candidate is published as a synchronized package train. Install matching RC versions across Anvia packages so Core, providers, transports, UI, storage, and observability adapters share the same public contracts.

## Check three boundaries

Before upgrading, verify:

1. The package's `peerDependencies` accepts your `@anvia/core` version.
2. The package's runtime and peer requirements match your application.
3. Its changelog contains no migration note that affects your configuration or stored data.

Package pages summarize these boundaries, while the package manifest remains the source of truth for exact dependency ranges.

## Release-candidate versions

Current Anvia packages use the `1.0.0-rc.x` prerelease line. Pin the exact RC in production-like environments because a later candidate may still include migration work before the stable `1.0.0` release.

```json
{
  "dependencies": {
    "@anvia/core": "1.0.0-rc.2",
    "@anvia/openai": "1.0.0-rc.2"
  }
}
```

Use your workspace's preferred lockfile and update packages intentionally rather than accepting an unreviewed range change.

## Runtime compatibility

Some adapters require a specific Node.js version, browser runtime, native dependency, database extension, or external service. These constraints differ by package. In particular:

- UI packages require compatible React versions.
- local embedding packages may download models or load native/WASM runtimes;
- database and vector adapters require compatible client libraries and schemas;
- `@anvia/sandbox` requires a supported Docker environment;
- `@anvia/browser` requires Docker, a compatible browser image, and Playwright-compatible Chromium;
- `@anvia/neo4j` requires Neo4j 2026.01 or newer and matching vector dimensions;
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

Keep an application on the v0 documentation and package line until its migration is complete. When moving to v1, update Core and every Anvia adapter together, then follow the [v1 Core API reference](/packages/core/api-reference) and provider-specific configuration pages.

## Upgrade checklist

- Read the relevant entry in [Changelog](/packages/changelog).
- Keep all Anvia packages on the same `1.0.0-rc.x` candidate.
- Compare public types used by your application.
- Run TypeScript, unit, integration, and evaluation suites.
- Test migrations against a copy of production data.
- Confirm traces, usage, tool calls, and streaming events still arrive as expected.
