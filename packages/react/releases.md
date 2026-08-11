# Releases

The current source manifest is `@anvia/react` **0.11.4**. Recent releases mainly track Core protocol changes while preserving the hook/transport boundary.

| Version | Summary |
| --- | --- |
| `0.11.4` | Updated the Core dependency to `0.25.1`. |
| `0.11.0` | Added model-aware context limits and active context usage to hook results. |
| `0.10.3` | Added first-class resume cursor support for shared request/response APIs. |
| `0.10.0` | Added memory-compaction-aware hydration that hides synthetic summaries by default. |
| `0.9.2` | Added public tool-call deltas by default and consistent append/replace argument handling. |
| `0.9.0` | Replaced stream animation presets with lifecycle-driven text and mixed-item smoothing. |
| `0.8.12` | Added cancellation behavior used by Studio streams, including partial transcript and human-input terminal state handling. |
| `0.8.0` | Added resumable chat state and transport envelopes. |
| `0.7.11` | Added `initialMessagesFromMemory`. |
| `0.7.9` | Expanded UI attachment, suggestion, tool-part, and human-input event handling for React UI. |
| `0.7.6` | Hardened overlapping sends and prevented implicit request bodies for GET/HEAD transports. |

## Upgrade checks

- Align `@anvia/core`, `@anvia/server`, and `@anvia/react-ui` when adopting protocol changes.
- Re-test custom event mappers whenever Core adds a stream event type.
- Verify stop behavior for custom transports; they must honor `AbortSignal`.
- When enabling resume, test reload, reconnect, terminal cleanup, and expired/missing server state.
- Keep smoothing lifecycle mounted long enough to drain when upgrading from preset-era versions.

Read the complete [React changelog](https://github.com/anvia-hq/anvia/blob/main/packages/react/CHANGELOG.md).
