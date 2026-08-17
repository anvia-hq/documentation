# Result mapping

Anvia maps MCP responses to the string result used by ordinary tools.

## 1. Map returned content

Text content is returned directly. Multiple content items are concatenated in server order.

Image content becomes a `data:<media-type>;base64,...` URL.

Text and binary resources retain their media type, URI, and text or blob in a serialized string.

A response containing `{ toolResult }` returns the string directly or JSON-serializes a non-string value when possible.

```ts
{
  content: [
    { type: 'text', text: 'The deployment is healthy.' },
  ],
}
```

The adapted tool returns `The deployment is healthy.`

## 2. Handle MCP error results

When `isError: true`, the adapted tool throws. Text content becomes the error message; without text, the message is `MCP tool returned an error`.

A direct `tool.call()` therefore rejects. Inside an agent run, normal tool execution catches the failure, records a failed tool event, and returns the error text to the model as a tool result unless another runtime boundary fails the run.

Do not expose raw MCP error text to a browser. It may include server names, paths, arguments, or upstream details.

## 3. Validate arguments

MCP tool calls accept a JSON object. `null` or `undefined` omits the `arguments` field. Arrays, primitives, and other non-object values reject before the remote call.

The remote server must still validate arguments and authorize the action. A model-facing input schema guides generation; it is not server-side enforcement.

## 4. Bound untrusted output

Remote text, images, and resources may be private, stale, malicious, or oversized. Use [middleware](/sdk/advanced/hooks/middleware) or an app-owned wrapper to truncate, redact, store large artifacts, or create a smaller model-facing result.

Next, enforce MCP [trust boundaries](/sdk/advanced/mcp/security).
