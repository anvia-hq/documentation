# `@anvia/cli`

`@anvia/cli` installs editable, application-owned React components on top of the strictly headless
`@anvia/react-ui` primitives. It uses shadcn to write Tailwind-ready source into an existing Next.js
or Vite application; it does not create an application.

## Add a complete chat

```sh
pnpm dlx @anvia/cli init vite
pnpm dlx @anvia/cli add chat
```

`init` prepares shadcn and `components.json`. `add chat` writes the complete component set below the
configured components alias—normally `src/components/anvia`—and installs the matching
`@anvia/react-ui` release.

Available registry items are `chat`, `thread`, `message`, `composer`, `attachment`, `markdown`, and
`tool-fallback`. The larger items include their component dependencies automatically.

The generated files belong to the application. Edit their Tailwind classes, composition, icons,
copy, and product-specific renderers directly. Runtime state and accessibility behavior remain in
the headless primitives.

Continue with [Get started](/packages/cli/get-started), [API reference](/packages/cli/api-reference),
or [`@anvia/react-ui`](/packages/react-ui).
