<p align="center">
  <img src="./public/logo.svg" alt="Anvia logo" width="88" />
</p>

<p align="center">
  <strong>Documentation for the Anvia SDK, Studio, Lens, packages, and architecture.</strong>
</p>

<p align="center">
  <a href="https://anvia.dev">Website</a> ·
  <a href="https://github.com/anvia-hq/anvia">Anvia source</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="https://github.com/anvia-hq/documentation/blob/main/LICENSE">MIT license</a>
</p>

This repository contains the VitePress site for Anvia. It explains how to build provider-neutral AI behavior with the SDK, inspect local runtimes with Studio, operate telemetry and evaluations with Lens, and use each published package through its public API.

## Documentation areas

| Area | Contents |
| --- | --- |
| `sdk/` | Models, agents, tools, memory, knowledge, pipelines, streaming, providers, and advanced runtime features. |
| `studio/` | Local agent and pipeline inspection, Playground workflows, tools, traces, storage, and configuration. |
| `lens/` | Observability, evaluations, datasets, workspace administration, and self-hosting. |
| `packages/` | Package catalog, compatibility guidance, changelogs, and public API references. |
| `faqs/` | Architecture, positioning, comparisons, capability choices, and production boundaries. |

## Requirements

- Node.js 22 or newer.
- pnpm 11 or newer.

## Local development

Install dependencies and start VitePress:

```sh
pnpm install
pnpm docs:dev
```

VitePress prints the local URL when the server is ready.

Build and preview the production site:

```sh
pnpm docs:build
pnpm docs:preview
```

The generated site is written to `.vitepress/dist`.

## Deployment

The site deploys to Cloudflare Workers as static assets through `wrangler.jsonc`.

Validate the complete build and Wrangler configuration without uploading:

```sh
pnpm docs:deploy:dry-run
```

Deploy after authenticating Wrangler:

```sh
pnpm exec wrangler login
pnpm docs:deploy
```

For CI, configure Cloudflare credentials in the deployment environment rather than committing them to this repository.

## Source accuracy

The implementation in [`anvia-hq/anvia`](https://github.com/anvia-hq/anvia) is the source of truth for package exports, runtime behavior, supported options, and compatibility requirements. Public API pages document exported package surfaces only; source files that are not exported are implementation details.

Comparison pages use official primary sources and include a review date because external products change independently of Anvia.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Keep documentation changes focused, verify code against the implementation, and run `pnpm docs:build` before requesting review.

## License

This repository is available under the [MIT License](https://github.com/anvia-hq/documentation/blob/main/LICENSE).
