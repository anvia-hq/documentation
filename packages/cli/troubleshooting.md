# Troubleshooting

::: info Upcoming CLI release
The `ui` command group and update `--apply` flag describe the reviewed development CLI and are
pending publication. Published CLI `1.3.0` uses the [legacy commands](/packages/cli/releases#published-cli-1-3-0).
To try these examples now, use the [development build](/packages/cli/get-started#try-the-development-build).
:::

## Grouped commands or `--apply` are unknown

You are likely running published CLI `1.3.0`. The grouped UI commands and `--apply` flag belong
to the upcoming release. Use the [development build](/packages/cli/get-started#try-the-development-build)
for this guide, or use the [published legacy commands](/packages/cli/releases#published-cli-1-3-0).

## React UI version cannot be found

Published CLI `1.3.0` requests `@anvia/react-ui@1.3.0` because it uses its own package version.
The reviewed development build records the React UI version with the registry instead. Anvia
packages release independently.

If you are using `1.3.0`, follow the
[explicit-version workaround](/packages/cli/components#install-the-registry-with-an-explicit-react-ui-version).
Check the versions of the packages you intend to install:

```sh
pnpm view @anvia/cli version
pnpm view @anvia/react-ui version
```

## Missing or unreadable `components.json`

Run `ui init vite` or `ui init next` from your existing application's root, or pass `--cwd` to that
directory. Component inspection and updates read `components.json`; skill commands do not.
Check that the file is readable JSON and that `aliases.components` describes your component path.

## Components alias cannot be resolved

The component updater reads `compilerOptions.paths` and `baseUrl` directly from the project's
root `tsconfig.json` or `jsconfig.json`. It supports exact mappings and wildcard mappings such
as this one:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

With `aliases.components` set to `@/components`, that resolves to `src/components/`.
The updater does not follow `extends`, workspace configuration, or Vite-specific aliases for
updates. Its configuration reader strips line comments but is not a full JSONC parser; block
comments and trailing commas can prevent resolution. Keep the required mapping in readable
root configuration, consistent with the alias shadcn uses for installation.

## An update reports changes in other components

Registry items share files. An existing dependency can make a larger item count as installed,
so an update of all items can restore files for that larger composition. Use `ui update <item>`
to narrow the selection. The [component update rules](/packages/cli/components#update-generated-components)
explain this behavior and what the updater does not change.

## A skills preview changed `AGENTS.md`

This is a known limitation of published CLI `1.3.0`: `skills update --agents` and `--codex` can
write immediately without `--force`. The reviewed development build previews every selected
target without writing. Use that build, or omit AGENTS.md target flags when comparing with `1.3.0`.
Keep your own instructions outside the Anvia markers.

## Skills or integrations remain outdated

Differing skill files, Claude copies, and Cursor rules are preserved during preview. Use `skills update --apply` to write them.
The CLI cannot distinguish a local edit from an older bundled file. Review the differences before
applying updates, and repeat the same `--dir`, `--cwd`, and target flags you used for installation.

Removing an entire skill directory keeps it out of future skill-tree updates. Run `skills init`
to restore it. Cursor rules and the AGENTS.md list can still reference removed skills because
those pointers are generated from every bundled name.

## The generated chat is blank or unstyled

Mount it inside `ChatProvider` with a `useChat` controller, give the parent a height, and ensure
Tailwind scans the generated `.tsx` files. Check theme tokens and the CSS added by shadcn.
The CLI does not create a server route: `/api/chat` must return the client protocol expected by
the transport. See the [working component example](/packages/cli/components#connect-the-generated-chat).

## A command fails

Check Node.js is at least `20.18.1`, `--cwd` points to the intended project, and `--dir` has a
value. `ui init` accepts only `next` or `vite`; `ui add` accepts one registry item; `ui update` accepts
zero or more item names; `skills` requires `init`, `update`, or `list`.

The CLI prints caught errors and sets exit code `1`. Unknown commands and options also fail.
It has no `--dry-run` option: run either update command without `--apply` for a preview.
See the [command reference](/packages/cli/api-reference#commands).
