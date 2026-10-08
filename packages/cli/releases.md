# CLI releases

The CLI package versions independently from React UI and the runtime SDK.

## Upcoming release

The reviewed development changes add:

- A `ui` group: `anvia ui init`, `anvia ui add`, and `anvia ui update`.
- Read-only previews for both update commands, including all selected skill integrations.
- A shared `--apply` flag and programmatic `apply: true` option for writing updates.
- Grouped help and errors for unknown commands or options.
- React UI dependency selection from the version recorded with the bundled registry.

Root UI commands remain compatibility aliases. `ui update --overwrite` and
`skills update --force` remain aliases for `--apply`. Installation flags retain their behavior.
The package version will be assigned during release; these changes are not in published `1.3.0`.

## Published CLI 1.3.0

The published package uses this command structure:

```sh
pnpm dlx @anvia/cli@1.3.0 init vite
pnpm dlx @anvia/cli@1.3.0 add chat
pnpm dlx @anvia/cli@1.3.0 update composer
pnpm dlx @anvia/cli@1.3.0 update composer --overwrite
pnpm dlx @anvia/cli@1.3.0 skills list
pnpm dlx @anvia/cli@1.3.0 skills init --codex
pnpm dlx @anvia/cli@1.3.0 skills update
pnpm dlx @anvia/cli@1.3.0 skills update --force
```

`add` requests the CLI's own version of React UI, so use the
[explicit-version registry workaround](/packages/cli/components#install-the-registry-with-an-explicit-react-ui-version)
with React UI `1.1.6`. Skill updates with `--agents` or `--codex` may write AGENTS.md without force;
omit those flags for a read-only comparison with this release.

`1.3.0` introduced the coding-agent integrations and bundled skills. `1.2.0` added component
inspection and updates; `1.1.1` preceded it. See the
[CLI changelog](https://github.com/anvia-hq/anvia/blob/main/packages/cli/CHANGELOG.md) for release entries.
