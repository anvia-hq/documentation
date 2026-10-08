# `@anvia/cli` API reference

## Commands

```text
anvia ui init [next|vite] [--cwd <path>] [--force]
anvia ui add <chat|thread|message|composer|attachment|markdown|tool-fallback>
  [--cwd <path>] [--overwrite]
anvia ui update [items...] [--cwd <path>] [--apply]
anvia skills list
anvia skills init [--claude] [--codex] [--cursor] [--agents]
  [--dir <path>] [--cwd <path>] [--force]
anvia skills update [--claude] [--codex] [--cursor] [--agents]
  [--dir <path>] [--cwd <path>] [--apply]
```

`ui init` delegates project setup to shadcn. `ui add` creates a temporary shadcn registry item,
installs it non-interactively, and removes the temporary registry file. `ui update` previews
installed component drift and writes only with `--apply`.

`skills init` copies bundled Anvia Agent Skills (including `anvia-durable`) into `skills/` (or
`--dir`). `skills update` previews changes to every selected target, including `AGENTS.md`, without
writing, and replaces differing files only with `--apply`. `skills list` prints the bundled names.
Target flags create integration files for Claude Code, Cursor, or AGENTS.md-based agents; `--codex`
is an alias for `--agents`. Unknown commands and options fail with exit code 1, and there is no
`--dry-run` flag because updates already preview.

Compatibility aliases remain supported:

| Legacy | Preferred |
| --- | --- |
| `anvia init` | `anvia ui init` |
| `anvia add` | `anvia ui add` |
| `anvia update` | `anvia ui update` |
| `anvia update --overwrite` | `anvia ui update --apply` |
| `anvia skills update --force` | `anvia skills update --apply` |

## Programmatic API

```ts
import {
  addRegistryItem,
  bundledSkillsDirectory,
  collectSkillFiles,
  createRegistryItem,
  initializeProject,
  initSkills,
  inspectInstalledItems,
  inspectInstalledSkills,
  isRegistryItemName,
  registryItemNames,
  skillNames,
  skillsTargetDirectory,
  updateInstalledItems,
  updateSkills,
  type AnviaRegistryItem,
  type RegistryItemName,
} from '@anvia/cli'
```

The update functions accept `apply: true` (retaining the `overwrite` and `force` compatibility options); skill target reports list `pending` paths during a preview, while `created` and `updated` contain actual writes. Programmatic methods are synchronous because they inspect or write local files and may invoke the
local shadcn CLI. Prefer the command-line interface unless another tool is composing Anvia registry
items or skill installations.

Return to the [`@anvia/cli` overview](/packages/cli).
