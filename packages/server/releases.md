# Releases

The current source manifest is `@anvia/server` **0.7.5**. Most patch releases track compatible Core updates; the entries below highlight Server behavior changes.

| Version | Summary |
| --- | --- |
| `0.7.5` | Updated the Core dependency to `0.26.0`. |
| `0.7.4` | Updated the Core dependency to `0.25.1`. |
| `0.7.0` | Carried model-aware context limits and active context usage through UI stream events. |
| `0.6.0` | Added `createEventStream({ resume })` and `createUIStreamResponse({ resume })` overloads for first-class stream continuation. |
| `0.5.0` | Added resumable event envelopes, replay/tail helpers, and the in-memory resumable stream store. |
| `0.4.6` | Hardened SSE control-field validation alongside transport behavior fixes. |
| `0.4.0` | Added the shared UI message stream protocol and `createUIStreamResponse`. |
| `0.3.1` | Split stream internals, added coverage-gated tests, and removed stack traces from default streamed error events. |
| `0.2.0` | Introduced JSONL and SSE response helpers. |

## Upgrade checks

- Upgrade `@anvia/core` with Server when the changelog lists a dependency alignment.
- Keep clients aligned with envelope and UI-event changes; resumable routes require a resume-aware React client.
- Re-test proxy buffering, content types, cancellation, and custom serializers after transport changes.
- When adopting resume, add shared persistence before enabling it across multiple production replicas.

Read the complete [Server changelog](https://github.com/anvia-hq/anvia/blob/main/packages/server/CHANGELOG.md).
