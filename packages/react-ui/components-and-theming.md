# Components and theming

React UI is a headless behavior layer designed for composition rather than one fixed chat layout.

## Compound components

Namespaces expose small parts instead of a single all-in-one widget:

```tsx
<MessagePrimitive.Root className="message">
  <MessagePrimitive.Content>
    <MessagePrimitive.Parts>
      {(part) =>
        part.type === 'text'
          ? <MessagePrimitive.Markdown className="prose" />
          : <MessagePrimitive.Part />
      }
    </MessagePrimitive.Parts>
  </MessagePrimitive.Content>
  <MessagePrimitive.Actions>
    <MessagePrimitive.Copy>Copy</MessagePrimitive.Copy>
    <MessagePrimitive.Regenerate>Try again</MessagePrimitive.Regenerate>
  </MessagePrimitive.Actions>
</MessagePrimitive.Root>
```

Render-function children can customize a part while retaining its current context. Use the exported context hooks when a separate application component needs the same state.

## Styling choices

The package exports no CSS. The application owns overflow, editor focus, textarea sizing, image
layout, overlays, disabled appearance, stream reveal, color, typography, spacing, and brand.

Style through ordinary props or stable attributes:

```css
[data-role='assistant'] {
  background: var(--surface-raised);
}

[data-role='tool'][data-state='error'] {
  color: var(--danger-text);
}
```

Inspect the rendered attributes for the part being styled. The stable semantic surface is ARIA plus
`data-state` and `data-role`; internal structure is not a styling API. Prefer explicit `className`
values on the exact primitives your application composes.

To start from editable Tailwind components instead, run `pnpm dlx @anvia/cli add chat` and modify
the generated application files directly.

## Design-system elements

Use `asChild` where a primitive supports it:

```tsx
<ComposerPrimitive.Submit asChild>
  <Button variant="primary">Send</Button>
</ComposerPrimitive.Submit>
```

The child must accept the forwarded props and ref. Preserve button semantics, keyboard behavior, accessible labels, and disabled state in the design-system component.

## Streamed Markdown

`MessagePrimitive.Parts` can smooth mixed message parts while preserving tool ordering.
`StreamMarkdown` is separate and context-free for applications that already own the displayed text.
Set `live` only on the growing tail and style `[data-state='revealing']` in the application. The CLI's
`markdown`, `message`, `thread`, and `chat` items install a reduced-motion-aware reveal animation.

Custom Markdown components control link, image, and code behavior. Apply the application's navigation, download, and untrusted-content policy there.
