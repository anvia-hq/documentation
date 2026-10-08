# Get started

Use Node.js **20.18.1 or newer** and run commands against the intended project directory.

::: info Upcoming CLI release
The `ui` command group and update `--apply` flag describe the reviewed development CLI and are
pending publication. Published CLI `1.3.0` uses the [legacy commands](/packages/cli/releases#published-cli-1-3-0).
To try these examples now, use the [development build](/packages/cli/get-started#try-the-development-build).
:::

## Try the development build

Check out the CLI PR branch in the [Anvia repository](https://github.com/anvia-hq/anvia/tree/codex/cli-command-groups),
then run from that repository's root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @anvia/cli... build
node packages/cli/dist/cli.js --help
```

The guides use `anvia` as shorthand for this built entrypoint. For example:

```sh
node packages/cli/dist/cli.js skills init --cwd /path/to/my-project --codex
```

After the new CLI release is published, the same commands will be available through its installed
`anvia` binary. The package version is assigned by the release process; these guides do not assume
an unpublished version number.

## Install knowledge for your coding agent

```sh
anvia skills list
anvia skills init --codex
```

This creates `skills/<name>/` and an Anvia section in `AGENTS.md`. For Claude Code or Cursor:

```sh
anvia skills init --claude
anvia skills init --cursor
```

Target flags can be combined. They add integrations alongside the canonical `skills/` copy.
Use `--cwd <path>` for another project and `--dir <path>` for another canonical directory:

```sh
anvia skills init --codex --cursor --dir agent-skills --cwd ./my-project
```

Skills installation needs no React application, shadcn configuration, or provider API key.
Read [Agent Skills](/packages/cli/agent-skills) for the catalog and output paths. Repeat target
flags and directory options during later updates.

## Prepare an existing React application

UI installation requires an existing Next.js or Vite application with Tailwind styling and
resolvable component aliases. Initialize shadcn from the application's root:

::: code-group

```sh [Vite]
anvia ui init vite
```

```sh [Next.js]
anvia ui init next
```

:::

`ui init` prepares shadcn and `components.json`. Use `--cwd <path>` for another directory.
`ui init --force` lets shadcn replace existing configuration. Install a complete chat composition:

```sh
anvia ui add chat
```

Follow the [component guide](/packages/cli/components) to connect `Chat` to a controller and server.

## Preview and apply updates

Both update commands write nothing by default, including selected agent integrations:

```sh
anvia ui update composer
anvia skills update --codex --cursor
```

Review the listed paths, then repeat the command with `--apply`:

```sh
anvia ui update composer --apply
anvia skills update --codex --cursor --apply
```

Applying changes replaces differing files without merging local edits. Read the
[skill update rules](/packages/cli/agent-skills#update-skills-and-integrations) and
[component update rules](/packages/cli/components#update-generated-components) before applying.
