# `@anvia/cli`

`@anvia/cli` installs editable, application-owned React components on top of the strictly headless
`@anvia/react-ui` primitives. It uses shadcn to write Tailwind-ready source into an existing Next.js
or Vite application; it does not create an application.

## Add a complete chat

```sh
pnpm dlx @anvia/cli ui init vite
pnpm dlx @anvia/cli ui add chat
```

UI commands live under `anvia ui`; the root-level `init`, `add`, and `update` commands remain
supported as compatibility aliases. `ui init` prepares shadcn and `components.json`. `ui add chat` writes the complete component set below the
configured components alias—normally `src/components/anvia`—and installs the matching
`@anvia/react-ui` release.

Available registry items are `chat`, `thread`, `message`, `composer`, `attachment`, `markdown`, and
`tool-fallback`. The larger items include their component dependencies automatically.

The generated files belong to the application. Edit their Tailwind classes, composition, icons,
copy, and product-specific renderers directly. Runtime state and accessibility behavior remain in
the headless primitives.

The CLI also installs bundled Agent Skills for coding agents with `anvia skills init`, including the
experimental `anvia-durable` skill. Both `ui update` and `skills update` preview changes and write
only when you pass `--apply`.

Continue with [Get started](/packages/cli/get-started), [API reference](/packages/cli/api-reference),
or [`@anvia/react-ui`](/packages/react-ui).
