# Result mapping

Anvia converts MCP call results into the same tool-result flow used by local tools.

## Content mapping

| MCP result | Anvia tool result |
| --- | --- |
| Text content | Text tool content. |
| Image content | A data URL with the supplied media type. |
| Text resource | Serialized resource URI, media type, and text. |
| Binary resource | Serialized resource URI, media type, and blob. |
| `{ toolResult }` | The string value, or a serialized non-string value. |
| `isError: true` | A thrown error using returned text when available. |

This normalization lets agents consume MCP tools without provider-specific result handling.

## Text results

An MCP response such as:

```ts
{
  content: [
    { type: 'text', text: 'The deployment is healthy.' },
  ],
}
```

becomes text that the agent receives as a normal tool result.

## Images and resources

Image bytes become data URLs so the runtime can preserve their media type. Resources retain their URI and content when serialized.

Treat remote content as untrusted input. A resource may be large, private, stale, or contain instructions that should not override the agent's application policy.

## Error results

When an MCP server returns `isError: true`, Anvia raises an error. If text accompanies the error, it is used to describe the failure.

Map remote failures at the server or runner boundary before returning them to users. Raw MCP errors may contain internal server names, paths, arguments, or upstream details.

## Tool arguments

MCP calls require JSON-object arguments. Invalid `null`, `undefined`, or non-object payloads are normalized where possible or rejected before the remote server is called.

The remote server must still validate its input. The model-facing schema helps construct arguments; it does not replace server-side validation or authorization.

## Limit result exposure

Review the maximum size and sensitivity of every result type. Use middleware or an app-owned wrapper when remote output needs truncation, redaction, artifact storage, or conversion into a smaller product-safe result before returning to the model or browser.
