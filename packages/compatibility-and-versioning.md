# Compatibility and versioning

Anvia packages are versioned independently. An application can therefore upgrade an adapter without forcing every package onto the same version, provided its declared peer-dependency range still includes the installed `@anvia/core` version.

## Check three boundaries

Before upgrading, verify:

1. The package's `peerDependencies` accepts your `@anvia/core` version.
2. The package's runtime and peer requirements match your application.
3. Its changelog contains no migration note that affects your configuration or stored data.

Package pages summarize these boundaries, while the package manifest remains the source of truth for exact dependency ranges.

## Pre-1.0 releases

Current Anvia packages use pre-1.0 versions. Minor releases can therefore contain meaningful API changes. Pin versions in production applications, review release notes, and test agent behavior as well as TypeScript compilation before deployment.

```json
{
  "dependencies": {
    "@anvia/core": "0.25.1",
    "@anvia/openai": "0.5.1"
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

## Agent builder compatibility

`AgentBuilder` remains supported for applications created before the declarative `new Agent({...})`
API. New code should use `Agent`; the compatibility builder is planned for removal when Anvia
prepares the 1.0 release.

The builder's singular `tool()` and `middleware()` methods are deprecated in favor of their plural
forms. `eventStore()` is also deprecated; use observers with Logger, Lens, Langfuse, or
OpenTelemetry for run inspection.

## Upgrade checklist

- Read the relevant entry in [Changelog](/packages/changelog).
- Compare public types used by your application.
- Run TypeScript, unit, integration, and evaluation suites.
- Test migrations against a copy of production data.
- Confirm traces, usage, tool calls, and streaming events still arrive as expected.
