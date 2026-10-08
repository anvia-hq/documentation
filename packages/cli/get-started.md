# Get started

Run the CLI from the root of an existing React application.

For Vite:

```sh
pnpm dlx @anvia/cli ui init vite
pnpm dlx @anvia/cli ui add chat
```

For Next.js:

```sh
pnpm dlx @anvia/cli ui init next
pnpm dlx @anvia/cli ui add chat
```

Use `--cwd <path>` when the application is not the current directory. The root-level `init`, `add`, and `update` commands still work as aliases for their `ui` equivalents. `ui init --force` allows shadcn
to replace existing configuration; `ui add --overwrite` allows it to replace existing generated
components. Review those changes before using either flag.

Add a narrower item when the application already owns the rest of the interface:

```sh
pnpm dlx @anvia/cli ui add message
pnpm dlx @anvia/cli ui add composer
```

The `chat`, `thread`, `message`, and `markdown` items also install the reduced-motion-aware stream
reveal CSS. All generated styling remains application-owned.

## Update installed components

`ui update` compares installed Anvia components against the bundled registry. It previews by default and writes nothing until you pass `--apply`:

```sh
pnpm dlx @anvia/cli ui update                # check every item (preview only)
pnpm dlx @anvia/cli ui update composer       # check a single item
pnpm dlx @anvia/cli ui update composer --apply
```

The preview reports each file as `up-to-date`, `modified` (the installed copy differs from the registry), or `missing`, then tells you to re-run with `--apply`. With `--apply` it writes registry content over out-of-date and missing files, but only for already-installed components; it never installs new items (use `ui add`). Locally edited copies are overwritten, so commit or stash changes first. You can name several items. Unknown item names get did-you-mean suggestions. Updates do not run shadcn, upgrade dependencies, refresh CSS, or delete obsolete files. The legacy `update --overwrite` still works as an alias for `--apply`.

## Install Agent Skills

Install the bundled Anvia knowledge for a coding agent, inspect the available skills, and update
them when the CLI changes:

```sh
pnpm dlx @anvia/cli skills list
pnpm dlx @anvia/cli skills init
pnpm dlx @anvia/cli skills update            # preview only
pnpm dlx @anvia/cli skills update --apply
```

The canonical files live under `skills/<name>/`. Add `--claude`, `--cursor`, or `--agents` to
generate the corresponding integration; `--codex` aliases `--agents`. Use `--dir <path>` to choose
a different canonical directory and `--cwd <path>` to target another project.

The bundled set covers agents, chat, RAG, MCP, pipelines, Studio, evaluations, channels, and the experimental `anvia-durable` skill. `anvia-durable` guides durable main agents, owned subagents, replay-safe tool and effect execution, approvals, persisted waits, task graphs, remote controls, and operations, and includes a local no-network restart smoke check. `skills list` shows every bundled name, and `skills init` installs them all.

`skills update` previews without writing any file, including `AGENTS.md`, and lists the paths that would change for every selected target. Repeat the same target flags and `--dir` when you update, then add `--apply` to write. `--apply` replaces differing files and restores missing files inside installed skill trees, so review the preview first. The legacy `skills update --force` still works as an alias for `--apply`. A skill you removed entirely is not reinstalled by an update; run `skills init` to restore it.
