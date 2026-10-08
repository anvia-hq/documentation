# Editable components

The CLI registry copies styled React source into your application. Behavior and accessibility
come from the headless `@anvia/react-ui` primitives; Tailwind classes and composition belong to
the generated files.

## Registry items

| Item | Files included |
| --- | --- |
| `chat` | All seven component files |
| `thread` | `attachment`, `markdown`, `tool-fallback`, `message`, `thread` |
| `message` | `attachment`, `markdown`, `tool-fallback`, `message` |
| `composer` | `attachment`, `composer` |
| `attachment` | `attachment` |
| `markdown` | `markdown` |
| `tool-fallback` | `tool-fallback` |

Every file has a `.tsx` extension. The target is `@components/anvia/<filename>`, resolved through
the `components` alias in `components.json`; a common result is `src/components/anvia/`.
The `chat`, `thread`, `message`, and `markdown` items also provide stream reveal CSS with a
reduced-motion fallback.

## Prepare your application

Use an existing Next.js or Vite React application, Node.js **20.18.1 or newer**, and Tailwind
styling. Run from the application root:

```sh
anvia ui init vite
```

Use `ui init next` for Next.js. The command delegates to shadcn with the Radix base and prepares
`components.json`. If shadcn is already configured, review that configuration before running
`ui init` or `ui init --force`.

## Install components

```sh
anvia ui add chat
```

Choose any item from the registry table above. The command writes application-owned files through
shadcn and installs the React UI version recorded alongside the bundled registry. CLI and React UI
versions are independent. Use `--cwd <path>` for another app and `--overwrite` to replace existing
component files during installation.

## Connect the generated chat

After installing the registry, create a client component such as `src/support-chat.tsx`:

```tsx
'use client'

import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import { ChatProvider } from '@anvia/react-ui'
import { Chat } from './components/anvia/chat'

const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })

export function SupportChat() {
  const controller = useChat({ transport })

  return (
    <div className="h-[600px]">
      <ChatProvider controller={controller}>
        <Chat />
      </ChatProvider>
    </div>
  )
}
```

Adjust the relative import when your component alias uses a different directory. The generated
chat uses the controller in `ChatProvider`; installing files does not construct an agent or
implement `/api/chat`. Follow [Build applications](/use-cases/build-applications) for a server
route that returns the matching client protocol. Keep provider credentials on the server.

The layout uses `h-full` and scrolling regions, so give its parent a height. Ensure Tailwind
scans the generated files and your theme defines tokens such as `background`, `foreground`,
`border`, and `muted-foreground`.

## Update generated components

Preview a selected item, then apply its file changes:

```sh
anvia ui update composer
anvia ui update composer --apply
```

Multiple names are accepted, for example `ui update composer markdown`. With no names, the CLI
checks all seven registry items. File statuses are `up-to-date`, `modified`, and `missing`.
`modified` means the content differs from the CLI's bundled source; it does not distinguish an
older version from your own edits. Applying changes replaces differing files without merging.

::: warning Shared files affect which items count as installed
An item counts as installed when any file in its dependency set exists. For example, an application
with only `attachment.tsx` is also treated as having incomplete `composer`, `message`, `thread`,
and `chat` items. An unrestricted `ui update --apply` can therefore create the other six files.
Name the item you intend to update and inspect its preview before applying it.
:::

An item with none of its files present is skipped even with `--apply`. Missing files in an
item that counts as installed are restored. Shared paths are counted and written once. `ui update --overwrite` remains an alias for `--apply`.

`ui update` rewrites component files directly. It does not run shadcn, upgrade npm dependencies,
refresh reveal CSS, or remove obsolete files. Review package versions and application styling
separately when changing the CLI version. Continue with [Troubleshooting](/packages/cli/troubleshooting).

## Install the registry with an explicit React UI version

::: tip Only needed for older CLI releases or explicit pinning
CLI `1.4.0` and later install the React UI version recorded with the bundled registry, so `ui add`
works without this workaround. CLI `1.3.0` and earlier requested a React UI version equal to the
CLI's own version, which may not be published (for example, `@anvia/react-ui@1.3.0`). Use the public
registry API below to select a published React UI version, such as `1.1.6`, explicitly.
:::

Install the CLI for the local registry-generation script, and install the controller and peers
used by the application:

```sh
pnpm add -D @anvia/cli
pnpm add @anvia/react-ui@1.1.6 @anvia/react @anvia/client react react-dom
```

Save this as `create-anvia-registry.mjs` in the application root:

```js
import { writeFileSync } from 'node:fs'
import { createRegistryItem } from '@anvia/cli'

const item = createRegistryItem('chat', { packageVersion: '1.1.6' })
writeFileSync('anvia-chat.registry.json', `${JSON.stringify(item, null, 2)}\n`)
```

Generate the JSON and let shadcn install its files, dependency, and CSS:

```sh
node create-anvia-registry.mjs
pnpm dlx shadcn@4.21.1 add ./anvia-chat.registry.json --yes
```

Add shadcn's `--overwrite` flag only when you intend to replace existing application files.
The registry JSON and generation script can be deleted after installation. To install a narrower
item, change `'chat'` in the script to one of the registry names above.

CLI `1.3.0` and earlier use the root `anvia add <item> [--cwd <path>] [--overwrite]` command. The CLI
has no command-line flag for overriding the React UI version; the override is available through
`createRegistryItem()`.
