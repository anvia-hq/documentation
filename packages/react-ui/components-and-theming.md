# Components and theming

React UI is designed for composition rather than one fixed chat layout.

## Compound components

Namespaces expose small parts instead of a single all-in-one widget:

```tsx
<Message.Root className="message">
  <Message.Content>
    <Message.Parts>
      {(part) =>
        part.type === 'text'
          ? <Message.Markdown className="prose" />
          : <Message.Part />
      }
    </Message.Parts>
  </Message.Content>
  <Message.Actions>
    <Message.Copy>Copy</Message.Copy>
    <Message.Regenerate>Try again</Message.Regenerate>
  </Message.Actions>
</Message.Root>
```

Render-function children can customize a part while retaining its current context. Use the exported context hooks when a separate application component needs the same state.

## Styling choices

The optional `styles.css` supplies limited structural behavior: overflow, editor focus, textarea sizing, image layout, zoom overlay positioning, context-meter structure, disabled opacity, and reduced-motion-aware stream reveal. It does not define a complete color, typography, spacing, or brand system.

Style through ordinary props or stable attributes:

```css
[data-anvia-message][data-role='assistant'] {
  background: var(--surface-raised);
}

[data-anvia-tool][data-state='error'] {
  color: var(--danger-text);
}
```

Inspect the rendered attributes for the part being styled. The package exposes family-specific `data-anvia-*` hooks for messages, tools, composer, attachments, human input, images, threads, and context usage.

## Design-system elements

Use `asChild` where a primitive supports it:

```tsx
<Composer.Submit asChild>
  <Button variant="primary">Send</Button>
</Composer.Submit>
```

The child must accept the forwarded props and ref. Preserve button semantics, keyboard behavior, accessible labels, and disabled state in the design-system component.

## Streamed Markdown

`Message.Parts` can smooth mixed message parts while preserving tool ordering. `StreamMarkdown` is separate and context-free for applications that already own the displayed text. Import `@anvia/react-ui/stream/styles.css` for its reveal transition and set `live` only on the growing tail.

Custom Markdown components control link, image, and code behavior. Apply the application's navigation, download, and untrusted-content policy there.
