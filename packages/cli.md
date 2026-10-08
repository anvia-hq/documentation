# `@anvia/cli`

`@anvia/cli` installs Anvia knowledge for your coding agent and editable React components for
your application. It runs on Node.js **20.18.1 or newer**.

Examples use `anvia` as shorthand for the published CLI. Run it with `pnpm dlx @anvia/cli` or
install `@anvia/cli` as a development dependency. The current release is `1.5.0`.

| Group | What it manages | Start here |
| --- | --- | --- |
| `anvia ui` | Application-owned Tailwind components over `@anvia/react-ui` primitives | [Components](/packages/cli/components) |
| `anvia skills` | `skills/<name>/` and optional Claude Code, Cursor, or AGENTS.md integrations | [Agent Skills](/packages/cli/agent-skills) |

## Commands at a glance

```sh
anvia ui init [next|vite]
anvia ui add <item>
anvia ui update [items...]          # preview
anvia ui update [items...] --apply

anvia skills list
anvia skills init
anvia skills update                # preview
anvia skills update --apply
```

Both update commands preview changes without writing files. Pass `--apply` to write them.
Legacy root `init`, `add`, and `update` commands remain aliases for the UI commands.

## Give your coding agent Anvia knowledge

```sh
anvia skills init --codex
```

This copies all ten bundled skills, including the experimental `anvia-durable` skill, into `skills/` and adds an Anvia section to `AGENTS.md`.
Choose `--claude`, `--cursor`, or `--agents` for another integration, or omit target flags to
install only the canonical files. Skills installation works in any project directory.

## Install editable components

```sh
anvia ui init vite
anvia ui add chat
```

UI setup configures shadcn in an existing Next.js or Vite application. It does not create an
application or a server endpoint. The registry contains `chat`, `thread`, `message`, `composer`,
`attachment`, `markdown`, and `tool-fallback`. Larger items include the files they depend on.
Generated components belong to your application and can be customized directly.

The CLI records the React UI version matching its bundled registry. Anvia packages release
independently; matching CLI and React UI version numbers are not a compatibility requirement.

Continue with [Get started](/packages/cli/get-started), [API reference](/packages/cli/api-reference),
[Troubleshooting](/packages/cli/troubleshooting), or [Releases](/packages/cli/releases).
