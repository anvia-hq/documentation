# Troubleshooting

## Grouped commands or `--apply` are unknown

You are running a CLI release older than `1.4.0`, which introduced the grouped UI commands and
`--apply`. Run the latest release with `pnpm dlx @anvia/cli@latest`, or upgrade a pinned
development dependency. On an older release, use the
[root commands](/packages/cli/releases#upgrading-from-cli-1-3-0-or-earlier).

## React UI version cannot be found

CLI `1.3.0` and earlier request the React UI version equal to the CLI's own version, for example
`@anvia/react-ui@1.3.0`. CLI `1.4.0` and later record the React UI version with the registry
instead. Anvia packages release independently.

Upgrade the CLI, or, if you must stay on an older release, follow the
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

This is a known limitation of CLI `1.3.0` and earlier: `skills update --agents` and `--codex` can
write immediately without `--force`. CLI `1.4.0` and later preview every selected target without
writing. Upgrade the CLI, or omit AGENTS.md target flags when comparing with an older release.
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
