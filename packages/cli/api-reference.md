# `@anvia/cli` API reference

## Commands

```text
anvia init [next|vite] [--cwd <path>] [--force]
anvia add <chat|thread|message|composer|attachment|markdown|tool-fallback>
  [--cwd <path>] [--overwrite]
anvia update [item] [--cwd <path>] [--overwrite]
anvia skills <init|update|list> [--claude] [--codex] [--cursor] [--agents]
  [--dir <path>] [--force] [--cwd <path>]
```

`init` delegates project setup to shadcn. `add` creates a temporary shadcn registry item, installs
it non-interactively, and removes the temporary registry file. `update` previews installed
component drift and applies it only with `--overwrite`.

`skills init` copies bundled Anvia Agent Skills into `skills/` (or `--dir`), `skills update`
refreshes installed skills behind a preview-then-`--force` contract, and `skills list` prints the
bundled names. Target flags create integration files for Claude Code, Cursor, or AGENTS.md-based
agents; `--codex` is an alias for `--agents`.

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

Programmatic methods are synchronous because they inspect or write local files and may invoke the
local shadcn CLI. Prefer the command-line interface unless another tool is composing Anvia registry
items or skill installations.

Return to the [`@anvia/cli` overview](/packages/cli).
