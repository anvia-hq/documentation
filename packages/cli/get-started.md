# Get started

Run the CLI from the root of an existing React application.

For Vite:

```sh
pnpm dlx @anvia/cli@rc init vite
pnpm dlx @anvia/cli@rc add chat
```

For Next.js:

```sh
pnpm dlx @anvia/cli@rc init next
pnpm dlx @anvia/cli@rc add chat
```

Use `--cwd <path>` when the application is not the current directory. `init --force` allows shadcn
to replace existing configuration; `add --overwrite` allows it to replace existing generated
components. Review those changes before using either flag.

Add a narrower item when the application already owns the rest of the interface:

```sh
pnpm dlx @anvia/cli@rc add message
pnpm dlx @anvia/cli@rc add composer
```

The `chat`, `thread`, `message`, and `markdown` items also install the reduced-motion-aware stream
reveal CSS. All generated styling remains application-owned.
