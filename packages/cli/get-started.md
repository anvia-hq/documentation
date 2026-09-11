# Get started

Run the CLI from the root of an existing React application.

For Vite:

```sh
pnpm dlx @anvia/cli init vite
pnpm dlx @anvia/cli add chat
```

For Next.js:

```sh
pnpm dlx @anvia/cli init next
pnpm dlx @anvia/cli add chat
```

Use `--cwd <path>` when the application is not the current directory. `init --force` allows shadcn
to replace existing configuration; `add --overwrite` allows it to replace existing generated
components. Review those changes before using either flag.

Add a narrower item when the application already owns the rest of the interface:

```sh
pnpm dlx @anvia/cli add message
pnpm dlx @anvia/cli add composer
```

The `chat`, `thread`, `message`, and `markdown` items also install the reduced-motion-aware stream
reveal CSS. All generated styling remains application-owned.

## Update installed components

`update` compares installed Anvia components against the current registry:

```sh
pnpm dlx @anvia/cli update            # check every item (preview only, writes nothing)
pnpm dlx @anvia/cli update composer   # check a single item
pnpm dlx @anvia/cli update --overwrite
```

Without `--overwrite`, `update` is a preview: it reports each file as `up-to-date`, `modified` (the installed copy differs from the registry), or `missing`. With `--overwrite` it writes registry content over out-of-date and missing files — but only for already-installed components; it never installs new items, use `add` for that. Locally edited copies are overwritten, so commit or stash changes first. Unknown item names get did-you-mean suggestions.
