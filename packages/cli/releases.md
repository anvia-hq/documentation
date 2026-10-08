# Releases

The current stable release is `@anvia/cli` **1.5.0**.

| Version | Summary |
| --- | --- |
| `1.5.0` | Bundled the experimental `anvia-durable` skill (durable main agents, owned subagents, replay-safe effects, approvals, persisted waits, task graphs, remote controls, operations, and a local restart smoke check), exposed through `skills list` and `skills init`. |
| `1.4.1` | Refreshed the package README. |
| `1.4.0` | Grouped UI commands as `anvia ui init`, `ui add`, and `ui update`, keeping root `init`, `add`, and `update` as aliases. UI and skills updates now preview without writing any file (including `AGENTS.md`) and write only with `--apply`; `ui update --overwrite` and `skills update --force` remain aliases. Unknown commands and options are rejected, help is grouped, and generated registry dependencies use the matching React UI package version. |
| `1.3.0` | Added `anvia skills init`, `skills update`, and `skills list` for installing verified Anvia Agent Skills into an application's `skills/` directory. Target flags support Claude Code, Cursor, and AGENTS.md/Codex integration. |
| `1.2.0` | Added `anvia update`: previews installed components as up-to-date, modified, or missing against the registry, and rewrites out-of-date files with `--overwrite` (never installs new items). Includes programmatic `inspectInstalledItems` / `updateInstalledItems` exports with did-you-mean suggestions. |
| `1.0.2` | Maintenance release; the changelog records no package-specific changes. |
| `1.0.1` | Maintenance release; the changelog records no package-specific changes. |
| `1.0.0` | Added shadcn-backed `init` and `add` commands for editable app-owned chat components built on `@anvia/react-ui` primitives. |

The first release contains registry items for a complete chat plus independent thread, message,
composer, attachment, Markdown, and fallback-tool components.

Review the [`@anvia/cli` package source](https://github.com/anvia-hq/anvia/tree/main/packages/cli)
and [changelog](https://github.com/anvia-hq/anvia/blob/main/packages/cli/CHANGELOG.md).
