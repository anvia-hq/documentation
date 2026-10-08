# Contributing to Anvia documentation

Thanks for helping make Anvia easier to understand and operate. Contributions can fix inaccurate examples, clarify architecture, document a package, improve navigation, or make the site more accessible.

## Before you start

- Read [README.md](README.md) for the repository structure and commands.
- Follow the Anvia [Code of Conduct](https://github.com/anvia-hq/anvia/blob/main/CODE_OF_CONDUCT.md).
- Check the current implementation in [`anvia-hq/anvia`](https://github.com/anvia-hq/anvia) before documenting an API or behavior.
- Search existing issues and pull requests to avoid duplicating active work.

## Set up the site

You need Node.js 22 or newer and pnpm 11 or newer.

```sh
pnpm install
pnpm docs:dev
```

Build the complete site before opening a pull request:

```sh
pnpm docs:build
```

For deployment-related changes, also run:

```sh
pnpm docs:deploy:dry-run
```

## Choose the right documentation area

| Change | Location |
| --- | --- |
| SDK concepts and guides | `sdk/` |
| Studio workflows | `studio/` |
| Lens operation and self-hosting | `lens/` |
| Package installation and public APIs | `packages/` |
| Positioning and short architectural answers | `faqs/` |
| Navigation | `.vitepress/config.ts` |
| Global presentation | `.vitepress/theme/` |

Keep changes scoped. Avoid combining broad wording changes, navigation redesigns, dependency updates, and unrelated visual work in one pull request.

## Content standards

### Lead with the answer

State the outcome or boundary first. Explain the mechanism only as far as it helps the reader make a decision or complete a task.

### Verify code against the implementation

- Use public package exports and exact import paths.
- Do not document internal `src` or unlisted `dist` paths as supported APIs.
- Include every identifier used by a snippet or show where it comes from.
- Do not imply that a schema provides authorization or that an identifier proves access.
- Distinguish runtime pipelines from durable workflow engines.
- Distinguish Studio development data from Lens production telemetry.

### Keep comparisons fair

Use official primary sources for other products. Explain their strengths, genuine overlap, architectural differences, when each option fits, and whether coexistence is practical. Add or update the review date when comparison claims change.

Avoid unsupported claims about performance, maturity, popularity, security, or features that only one project can provide.

### Treat production guidance carefully

State what Anvia provides and what remains application-owned. Authentication, authorization, tenant isolation, secrets, hosting, durable jobs, database operations, and incident response do not appear automatically by installing a package.

## SDK validation

Keep an Anvia source checkout beside this repository, or set `ANVIA_REPO` to its absolute path. Install that checkout's dependencies, then run:

```sh
pnpm sdk:check
# For a checkout in another location:
ANVIA_REPO=/path/to/anvia pnpm sdk:check
```

This checks SDK imports and snippet API shapes against public source entrypoints and runs offline contract tests. Complete examples marked with `ts anvia-check` are checked with all TypeScript diagnostics enabled, including missing variables and implicit `any`. Ordinary fragments retain the narrower API check; it is not proof that they are standalone programs. The runtime tests extract selected Markdown examples and provide application fixtures, so changing those examples changes the tested behavior.

Add complete examples and runtime scenarios when documenting a new contract. Keep tests free of provider credentials and live calls. The `validate-sdk` CI job pins the reviewed Anvia commit; update that pin and rerun the checks when aligning documentation with another SDK revision.

For changes to `packages/cli.md` or `packages/cli/`, also run:

```sh
pnpm cli:check
```

This checks the CLI guide imports and snippet API shapes against the same Anvia checkout.
Examples that import generated application files also need verification with those files present;
the snippet checker does not create an application or install a shadcn registry.

## Links and navigation

- Use root-relative links for pages in this site, such as `/sdk/tools/security`.
- Link to the exact external source that supports a changing claim.
- Keep sidebar labels short enough to remain on one line.
- Do not make section labels collapsible when their pages are always meant to remain visible.
- Run the full build so VitePress can detect unresolved internal links.

## Screenshots

- Capture product screenshots at 2560 × 1440.
- Use authentic application state; do not fabricate traces, evaluations, memory, or provider results.
- Remove credentials, tokens, customer content, and private identifiers.
- Prefer a maintained UI state over a screenshot when the image would become stale quickly.
- Store Studio images under `public/images/studio/` and Lens images under `public/images/lens/`.

Documentation images receive the site's standard frame and click-to-expand dialog automatically.

## Pull requests

Include:

- what changed and why;
- the pages or navigation affected;
- commands used for validation;
- screenshots for visible layout changes;
- source links for new or updated comparison claims;
- known limitations or follow-up work.

Before requesting review, confirm:

- `pnpm docs:build` passes;
- new pages appear in the intended sidebar;
- code fences and examples are complete;
- internal links resolve;
- the lockfile changed only when dependencies changed;
- no generated `.vitepress/dist` or `.wrangler` files are committed.

## Security and private data

Do not put API keys, credentials, private prompts, customer data, production traces, or secret environment values in issues, pull requests, examples, or screenshots.

Report security-sensitive implementation findings privately through the main [Anvia repository](https://github.com/anvia-hq/anvia) rather than opening a public issue with exploit details.

## License

By contributing, you agree that your contribution will be licensed under this repository's [MIT License](https://github.com/anvia-hq/documentation/blob/main/LICENSE).
