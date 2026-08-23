# `@anvia/cli` API reference

## Commands

```text
anvia init [next|vite] [--cwd <path>] [--force]
anvia add <chat|thread|message|composer|attachment|markdown|tool-fallback>
  [--cwd <path>] [--overwrite]
```

`init` delegates project setup to shadcn. `add` creates a temporary shadcn registry item, installs
it non-interactively, and removes the temporary registry file.

## Programmatic API

```ts
import {
  addRegistryItem,
  createRegistryItem,
  initializeProject,
  isRegistryItemName,
  registryItemNames,
  type AnviaRegistryItem,
  type RegistryItemName,
} from '@anvia/cli'
```

Programmatic methods are synchronous because they invoke the local shadcn CLI and write project
files before returning. Prefer the command-line interface unless another tool is composing Anvia
registry items.

Return to the [`@anvia/cli` overview](/packages/cli).
