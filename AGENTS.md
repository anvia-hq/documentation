# AGENTS.md

Guidance for coding agents working in this repository.

## Project Shape

This repository contains the VitePress documentation for the Anvia SDK, Studio,
Lens, Channels, package references, and application examples. SDK implementation
lives in the separate `anvia-hq/anvia` repository.

Workspace members in `pnpm-workspace.yaml` are the root site (`.`) and
`examples/golden-path`, a runnable application with its own checks.

Use Node from `.nvmrc` (24); `package.json` requires `^24.12.0`. Use pnpm from the
repository root. CI uses pnpm **11.22.0** for the site and golden-path example,
and **11.0.4** for the SDK validation jobs and their source checkout.

## Before Editing

- Check `git status --short --branch` and preserve unrelated work.
- Read `README.md`, `CONTRIBUTING.md`, and the pages and scripts you will change.
- Verify every API claim, snippet, and SDK version against Anvia source at
  `reviewedSdkRevision` in `scripts/sdk-coverage.json`. Read manifests, public
  exports, implementation, tests, and changelogs; do not assume `main` matches it.
- Channels packages are explicit sibling-repository exclusions in the coverage
  inventory. Verify their claims against their owning source separately.
- Keep changes scoped. Avoid unrelated wording, navigation, dependency, or
  formatting changes.
- Do not hand-edit build output or commit secrets, API keys, credentials, private
  prompts, customer data, production traces, or secret environment values.

## Common Commands

Run from the repository root, using pnpm 11.22.0 for site work:

```sh
nvm install
nvm use
pnpm install --frozen-lockfile
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
pnpm example:golden-path:check
```

`pnpm docs:build` is required before a PR. `docs:preview` serves the production
build. `example:golden-path:check` runs the example's typecheck and smoke test.

SDK checks default to the sibling checkout `../anvia`. Use the full reviewed
commit from `scripts/sdk-coverage.json`, install that checkout's dependencies,
and build the packages needed by the checks. CI uses pnpm 11.0.4 there and runs:

```sh
# Run inside the Anvia source checkout.
pnpm install --frozen-lockfile
pnpm --filter @anvia/core build
```

Core's built `dist/` output is required even though checks import source: provider
and Durable workspace imports resolve through Core's package exports. Rebuild
after changing the SDK revision; source dependencies alone are insufficient.

Then run from this documentation repository:

```sh
pnpm sdk:check
pnpm cli:check
node scripts/check-sdk-coverage.mjs
node scripts/typecheck-rc-snippets.mjs --source
node --test scripts/test-sdk-coverage.mjs
```

For another checkout location, set `ANVIA_REPO` to its absolute path for these
checks, for example `ANVIA_REPO=/path/to/anvia pnpm sdk:check`.

## Formatting And Style

- Lead with the answer or outcome. Explain mechanisms only as needed to help
  readers make decisions and complete tasks.
- Match nearby Markdown, TypeScript, and Vue formatting. Root `package.json`
  does not define lint or format scripts; do not copy SDK-repository commands.
- Use public package exports and exact import paths. Include every identifier
  in complete snippets or explain its application-owned source in fragments.
- Use root-relative internal links, such as `/sdk/tools/security`, and short
  sidebar labels. Preserve intentionally visible, non-collapsible sections.
- Support comparison claims with official primary sources and a review date.
- State application-owned responsibilities explicitly, including authorization,
  tenant isolation, secrets, persistence, and deployment. Distinguish runtime
  pipelines from durable workflows and Studio data from Lens telemetry.
- Use authentic, sanitized screenshots at 2560 × 1440. Studio images belong in
  `public/images/studio/`; Lens images belong in `public/images/lens/`.

## Documentation Boundaries

Concepts and task guides belong in their product area. `packages/` documents
installation, compatibility, and supported public APIs, not internal SDK paths.
Do not present unexported `src/` or `dist/` imports as supported APIs.

When adding or moving a page:

1. Follow the owning section's page patterns and update internal links.
2. Update the relevant sidebar in `.vitepress/config.ts`.
3. Update `public/llms.txt` and the relevant `public/llms-*.txt` topic guides so
   discovery links and representative APIs stay aligned with the pages.
4. Update coverage guide/reference links and checked examples when applicable.
5. Run the full build to catch unresolved internal links.

`examples/golden-path.md` is the tutorial; `examples/golden-path/` is the runnable
workspace. VitePress excludes that workspace's files through `srcExclude`.

## Documentation Map

- `guide/`: introduction, getting started, core concepts, and configuration.
- `sdk/`: models, agents, tools, memory, knowledge, pipelines, streaming,
  providers, evaluations, and advanced runtime guides.
- `channels/`: platform adapters, agent bridges, delivery, and channel releases.
- `examples/`: use-case examples and the golden-path tutorial/workspace.
- `studio/`: local runtime inspection, playgrounds, traces, and configuration.
- `lens/`: observability, evaluations, datasets, administration, and self-hosting.
- `packages/`: package catalog, compatibility, public API references, and releases.
- `faqs/`: architecture, product boundaries, capability choices, and comparisons.
- `use-cases/`: application building, observability, and production guidance.
- `references/`: reference entry point linking to package API documentation.
- `.vitepress/config.ts`: site configuration, navigation, sidebars, and base path.
- `.vitepress/theme/`: shared Vue components, styles, and code theme.
- `public/`: static assets, product screenshots, and curated LLM text guides.
- `sdk-coverage.md` and `scripts/sdk-coverage.json`: reviewed SDK coverage decisions.

## Testing Notes

- `pnpm sdk:check` runs `sdk:check:exports`, `sdk:check:types`, and
  `sdk:check:runtime` in order. The first two use `--sdk --source` and focus on
  `sdk/`; runtime checks also exercise selected package-reference examples.
- Run `pnpm cli:check` for `packages/cli.md` or `packages/cli/` changes. It runs
  `cli:check:exports` and `cli:check:types` with `--cli --source`. Generated app
  imports need separate verification with those files present; the checker does
  not scaffold an app or install a component registry.
- `node scripts/typecheck-rc-snippets.mjs --source` scans repository Markdown and
  public LLM text files, including package references outside the focused checks.
- Complete fences marked `ts anvia-check` receive all TypeScript diagnostics.
  Ordinary fragments receive selected API-shape diagnostics; passing does not
  prove they are standalone programs.
- Keep `anvia-check` markers, inventory feature pages/symbols/markers/test names,
  and `scripts/check-sdk-runtime.mjs` scenarios in sync. Add complete examples
  and offline contract cases when documenting new behavior.
- Runtime checks execute selected actual Markdown examples with fake providers
  and application fixtures. Keep them free of credentials and live provider calls.
- The golden-path smoke test uses a scripted provider, fake Discord gateway,
  and local telemetry receiver. Run its root check when the example changes;
  CI validates it separately from the SDK source checks.
- Coverage hashes track export names, not signatures, defaults, or behavior.
  Neither coverage nor snippet checks prove shell commands, live provider
  availability, or deployment health.

## Scripts

Validation and maintenance live in `scripts/`:

- `audit-rc-api.mjs`: checks static Anvia imports against public entrypoints and
  exported names; `--source` resolves source rather than built declarations.
- `typecheck-rc-snippets.mjs`: checks fenced examples with TypeScript from the SDK
  checkout. Both audit/typecheck scripts support `--sdk` and `--cli` scopes.
- `check-sdk-runtime.mjs`: runs offline documentation contracts using `node:test`.
- `check-sdk-coverage.mjs`: validates entrypoint coverage, export-name snapshots,
  feature markers/runtime-test names, utility decisions, and static imports.
- `test-sdk-coverage.mjs`: tests failure detection for the coverage checker.
- `audit-rc-source-links.mjs`: checks GitHub source-link refs and local path
  existence. `ANVIA_REF` defaults to `main`; account for deliberate pinned links
  when interpreting results. It does not verify linked behavior.
- `migrate-*.mjs` and `fix-rc-provider-options.mjs`: rewrite documentation examples
  in place. Read their transformations before use and inspect every resulting diff;
  they are maintenance tools, not routine validation commands.

Run `node scripts/check-sdk-coverage.mjs --refresh` only after reviewing the SDK
surface and updating coverage decisions. It rewrites `scripts/sdk-coverage.json`
with export counts/name hashes and sets `reviewedSdkRevision` to SDK HEAD. It
requires a clean SDK package working tree and successful coverage validation;
it does not write missing documentation or automatically add entrypoint decisions.

Review every `reviewedSdkRevision` bump and its source diff. Refreshing snapshots
can hide undocumented new exports. Do not use it merely to silence a failure.
Re-run `pnpm sdk:check`, coverage, and the broader snippet checks against that
exact revision, plus `pnpm cli:check` when relevant. Both SDK CI jobs fetch the
full reviewed commit from the inventory, rather than following SDK `main`.

## Generated Files

- Do not hand-edit or commit `.vitepress/dist/`, `.vitepress/cache/`, `.wrangler/`,
  or `node_modules/`.
- Treat the coverage inventory as reviewed data with generated snapshot fields;
  inspect refresh diffs before accepting them.
- `public/llms*.txt` are curated content to maintain alongside the pages.
- Inspect unexpected generator changes before continuing.

## Dependencies

- Use pnpm and keep `pnpm-lock.yaml` changes tied to intentional dependency work.
- Root development dependencies support the site and deployment; the runnable
  example owns its application dependencies in `examples/golden-path/package.json`.
- Preserve deliberate `allowBuilds` and `minimumReleaseAgeExclude` settings in
  `pnpm-workspace.yaml`; do not broaden them just to bypass an install failure.
- After dependency changes, run `pnpm docs:build` and the relevant example or SDK
  checks. Verify package compatibility from declared dependency and peer ranges.

## Versions And Deployment

The site documents stable Anvia v1 at `/`; `DOCS_BASE` supports other preview
mount paths. Keep version baselines in `packages/compatibility-and-versioning.md`,
affected package pages and `releases.md` files, `packages/changelog.md`, LLM guides,
and the SDK coverage review consistent with the reviewed source.

Packages version independently. A reviewed source version is not proof of the
currently published npm tag. Check manifests and source changelogs before changing
release claims; a baseline refresh alone does not establish feature coverage.

Deployment uses Cloudflare Workers static assets from `.vitepress/dist`, configured
in `wrangler.jsonc`. `.github/workflows/deploy.yml` builds on PRs and main pushes;
deployment is gated to `main` and non-PR events, including manual runs on main.

Never run `pnpm docs:deploy` or `wrangler deploy`. Deployments happen from CI on
`main`, even though the README describes a local deployment command. For deployment
configuration changes, `pnpm docs:deploy:dry-run` is allowed: it builds and validates
Wrangler configuration without uploading. Keep Cloudflare credentials in CI secrets.

## Pull Request Expectations

Before handing work back, report:

- What changed, why, and which pages or navigation are affected.
- Validation commands run; `pnpm docs:build` must pass before requesting review.
- Checks skipped and why, including unavailable SDK source or build prerequisites.
- Any intentional generated snapshot, reviewed revision, or dependency changes.
- Source links and review dates for changed comparisons; known limitations or follow-up.

Confirm new pages appear in the intended sidebar, examples are complete, internal
links resolve, and build artifacts are excluded. For visible layout changes,
include screenshots or state that visual verification was not run.
