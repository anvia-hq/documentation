# `@anvia/cli` API reference

Use the root `@anvia/cli` export for programmatic integration. Functions are synchronous.
File APIs inspect or modify local files; `initializeProject()` and `addRegistryItem()` also invoke
the bundled shadcn CLI. Exceptions propagate to programmatic callers.

## Commands

Use `anvia` as shorthand for `pnpm dlx @anvia/cli` or an installed `@anvia/cli` binary. This reference describes CLI `1.5.0`.

```text
anvia ui init [next|vite] [--cwd <path>] [--force]
anvia ui add <chat|thread|message|composer|attachment|markdown|tool-fallback>
  [--cwd <path>] [--overwrite]
anvia ui update [items...] [--cwd <path>] [--apply]
anvia skills init [--claude] [--codex] [--cursor] [--agents]
  [--dir <path>] [--force] [--cwd <path>]
anvia skills update [--claude] [--codex] [--cursor] [--agents]
  [--dir <path>] [--apply] [--cwd <path>]
anvia skills list
```

| Command | Behavior |
| --- | --- |
| `ui init` | Configure shadcn in an existing app. Optional template is `next` or `vite`; omitting it leaves detection to shadcn. Uses the Radix base and `--no-monorepo`. |
| `ui add` | Install one registry item through shadcn, using the React UI version recorded with its bundled registry. Temporary registry JSON is removed afterward. |
| `ui update` | Preview zero or more named items; no names means all registry items. Apply differing and missing files in items that count as installed with `--apply`. |
| `skills init` | Install all bundled skills in the canonical directory and add selected integrations. |
| `skills update` | Preview installed skill trees and selected integrations, including AGENTS.md. Apply changes with `--apply`. |
| `skills list` | Print bundled names. No project inspection or writes. |

| Option | Applies to | Default and effect |
| --- | --- | --- |
| `--cwd <path>` | UI commands, `skills init/update` | Current working directory; selects the project |
| `--dir <path>` | `skills init/update` | `skills`; canonical directory within the project |
| `--apply` | `ui update`, `skills update` | False; explicitly write previewed changes |
| `--force` | `ui init`, `skills init` | False; replace shadcn configuration or differing skill files/rules |
| `--overwrite` | `ui add` | False; allow component file replacement during installation |
| `--claude` | `skills init/update` | Add the `.claude/skills/` copy |
| `--cursor` | `skills init/update` | Add `.cursor/rules/` pointers |
| `--agents`, `--codex` | `skills init/update` | Maintain the Anvia section in `AGENTS.md`; both select the same integration |
| `--help`, `-h` | Root, groups, actions | Show usage without invoking installation or update functions |

Root `init`, `add`, and `update` remain UI aliases. `ui update --overwrite` and
`skills update --force` remain aliases for `--apply`. Unknown commands and options fail with exit
code `1`. There is no `--dry-run` flag: updates already preview by default. Unknown item names get
suggestions when a registry name is within an edit distance of two.

Component updates can expand shared-file compositions. Read [Agent Skills](/packages/cli/agent-skills)
and [Components](/packages/cli/components) before applying changes.

## Public exports

All 30 public exports are available from the root:

```ts anvia-check
import {
  addRegistryItem,
  bundledSkillsDirectory,
  closestRegistryItemName,
  collectSkillFiles,
  createRegistryItem,
  initializeProject,
  initSkills,
  inspectInstalledItems,
  inspectInstalledSkills,
  isRegistryItemName,
  isSkillsTarget,
  registryItemNames,
  skillNames,
  skillsTargetDirectory,
  skillsTargetNames,
  updateInstalledItems,
  updateSkills,
  type AnviaRegistryItem,
  type InstalledFileStatus,
  type InstalledItemFile,
  type InstalledItemReport,
  type InstalledSkillFile,
  type InstalledSkillReport,
  type RegistryItemName,
  type SkillFileStatus,
  type SkillsOptions,
  type SkillsTarget,
  type SkillsTargetResult,
  type SkillsWriteMode,
  type SkillsWriteResult,
} from '@anvia/cli'
```

## Component registry functions

### `createRegistryItem(name, options?)`

Returns `AnviaRegistryItem` for a `RegistryItemName`. Options are `packageVersion?: string` and
`registryDirectory?: string`; defaults are the React UI version stored in the registry metadata and bundled registry directory.
Changing `registryDirectory` selects different source files; use `packageVersion` to override the
React UI dependency version independently.
`packageVersion` sets the exact React UI dependency string, rather than selecting component source
from another CLI release.

```ts anvia-check
import { createRegistryItem } from '@anvia/cli'

const item = createRegistryItem('chat', { packageVersion: '1.1.6' })
console.log(item.dependencies, item.files.map((file) => file.target))
```

### `initializeProject(options?)`

Returns `void`. Options are `cwd?: string`, `force?: boolean`, and `template?: 'next' | 'vite'`.
Invokes shadcn `init` with `--yes`, `--no-monorepo`, and `--base radix`, forwarding the template
and force flag when supplied. The default project directory is `process.cwd()`.

### `addRegistryItem(name, options?)`

Returns `void`. Takes a `RegistryItemName` and `{ cwd?: string; overwrite?: boolean }`.
Invokes shadcn `add` non-interactively and cleans up its temporary registry file even on failure.
This function has no `packageVersion` option; generate a registry with `createRegistryItem()`
when you need to override the dependency version.

### `inspectInstalledItems(options?)`

Returns `InstalledItemReport[]`. Options are `cwd?: string`,
`items?: readonly RegistryItemName[]`, and `registryDirectory?: string`.
Defaults to all registry items and the bundled source. Reads project configuration and files;
it does not write. Reports each item's `installed`, `complete`, and file statuses.

### `updateInstalledItems(options?)`

Takes the inspection options plus `apply?: boolean` and the compatibility alias `overwrite?: boolean`, both defaulting to false.
Returns `{ report: InstalledItemReport[]; updated: string[] }`. The report describes the state
**before** applying changes; `updated` lists paths written. Shared paths are written once.

```ts anvia-check
import { inspectInstalledItems, updateInstalledItems } from '@anvia/cli'

const report = inspectInstalledItems({ cwd: './my-app', items: ['composer'] })
console.log(report)

// Comparison only: apply defaults to false.
const preview = updateInstalledItems({ cwd: './my-app', items: ['composer'] })
console.log(preview.updated)

const applied = updateInstalledItems({ cwd: './my-app', items: ['composer'], apply: true })
console.log(applied.updated)
```

`registryDirectory` overrides the registry source directory, useful when composing or testing
another local registry. Neither inspection nor update invokes shadcn. See the
[configuration constraints](/packages/cli/troubleshooting#components-alias-cannot-be-resolved).

### Registry names and validation

| Export | Signature or value |
| --- | --- |
| `registryItemNames` | Readonly tuple: `chat`, `thread`, `message`, `composer`, `attachment`, `markdown`, `tool-fallback` |
| `RegistryItemName` | Union derived from the tuple |
| `isRegistryItemName` | `(value: string) => value is RegistryItemName` |
| `closestRegistryItemName` | `(value: string) => RegistryItemName \| undefined`; returns the closest name only when distance is at most two |

## Skill discovery functions

| Function | Parameters and return value |
| --- | --- |
| `bundledSkillsDirectory()` | No parameters; returns the bundled `dist/skills/` path as a `string` |
| `skillNames(options?)` | `{ skillsDirectory?: string }`; returns sorted bundled directory names as `string[]` |
| `skillsTargetDirectory(options?)` | `{ cwd?: string; dir?: string }`; joins the project directory and canonical directory; defaults to `process.cwd()` and `skills` |
| `collectSkillFiles(root)` | `root: string`; recursively collects regular files as relative paths with `/` separators; returns `string[]` |

Discovery helpers read local files. `skillsDirectory` overrides the bundled source, while `dir`
selects the canonical destination. They serve different purposes.

## Skill installation functions

| Function | Parameters | Return value |
| --- | --- | --- |
| `inspectInstalledSkills(options?)` | `SkillsOptions` | `InstalledSkillReport[]`; read-only canonical comparison |
| `initSkills(options?)` | `SkillsOptions & { force?: boolean }` | `SkillsWriteResult`; fills missing files, preserving differing files unless forced |
| `updateSkills(options?)` | `SkillsOptions & { apply?: boolean; force?: boolean }` | `SkillsWriteResult`; visits installed skill trees and selected integrations |

```ts anvia-check
import { initSkills, inspectInstalledSkills } from '@anvia/cli'

const options = {
  cwd: './my-project',
  dir: 'agent-skills',
  targets: ['cursor', 'codex'] as const,
}

const result = initSkills(options)
console.log(result.created, result.targets)
console.log(inspectInstalledSkills(options))
```

Both write functions always include the canonical `anvia` target. Result `created` and `updated`
arrays cover that canonical copy; integration changes are in `targets`. During preview, `targets[].pending` lists paths that would change;
`created` and `updated` only contain actual writes. `updateSkills()` writes nothing unless `apply` or
its compatibility alias `force` is true, including selected AGENTS.md targets. The skill report describes
the canonical files **after** synchronization. `inspectInstalledSkills()` does not inspect Claude
copies, Cursor rules, or `AGENTS.md`.

### Preview and apply programmatically

```ts anvia-check
import { updateSkills } from '@anvia/cli'

const options = { cwd: './my-project', targets: ['cursor', 'codex'] as const }
const preview = updateSkills(options)
console.log(preview.targets.flatMap((target) => target.pending ?? []))

// Run after reviewing the pending paths.
const applied = updateSkills({ ...options, apply: true })
console.log(applied.targets.flatMap((target) => [...target.created, ...target.updated]))
```

### Skill options and targets

```ts
// Public type; all fields are optional.
type SkillsOptions = {
  cwd?: string
  dir?: string
  skillsDirectory?: string
  targets?: readonly SkillsTarget[]
}

type SkillsTarget = 'anvia' | 'claude' | 'codex' | 'cursor' | 'agents'
type SkillsWriteMode = 'init' | 'update'
```

`skillsTargetNames` is the readonly tuple `['anvia', 'claude', 'codex', 'cursor', 'agents']`.
`isSkillsTarget(value: string): value is SkillsTarget` validates a target name. `SkillsWriteMode`
is exported for integrations; `initSkills()` and `updateSkills()` select their own mode.

## Report types

`InstalledFileStatus` and `SkillFileStatus` are both `'up-to-date' | 'modified' | 'missing'`.
Content comparison is exact; it cannot distinguish local edits from older package content.

```ts
type InstalledItemFile = {
  filename: string
  path: string
  status: InstalledFileStatus
}

type InstalledItemReport = {
  name: RegistryItemName
  installed: boolean
  complete: boolean
  files: InstalledItemFile[]
}

type InstalledSkillFile = {
  relativePath: string
  path: string
  status: SkillFileStatus
}

type InstalledSkillReport = {
  name: string
  installed: boolean
  complete: boolean
  files: InstalledSkillFile[]
}

type SkillsTargetResult = {
  pending?: string[]
  target: SkillsTarget
  created: string[]
  updated: string[]
  skipped: number
}

type SkillsWriteResult = {
  report: InstalledSkillReport[]
  created: string[]
  updated: string[]
  targets: SkillsTargetResult[]
}
```

`installed` means at least one expected file exists; `complete` means all expected files exist.
Skill-tree `skipped` counts differing files and missing files skipped during an unforced update.
Cursor `skipped` counts differing rules; missing unforced-update rules are left absent without
incrementing that count. AGENTS.md previews list the pending section path without writing; installation and applied updates
synchronize only the generated section.

`AnviaRegistryItem` describes a shadcn registry item with `$schema`, `name`, `title`, `description`,
`dependencies: string[]`, `type: 'registry:block' | 'registry:component'`, and `files`. Each file has
`content`, `path`, `target`, and `type: 'registry:component'`. Optional `css` contains nested shadcn
CSS rules. Items with one file are components; larger items are blocks.

Return to the [CLI overview](/packages/cli).
