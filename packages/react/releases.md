# Releases

The current source manifest is `@anvia/react` **1.0.0-rc.2**. The entries below preserve notable v0 protocol milestones.

| Version | Summary |
| --- | --- |
| `v1-rc3` source | Adopted client protocol v3, persisted interaction-aware resume state, added `waiting` status, and replaced separate approval/question methods with `interactions` plus `respondToInteraction()`. |
| `1.0.0-rc.2` | Synchronized React with the Anvia 1.0 release-candidate train. |
| `0.11.5` | Updated the Core dependency to `0.26.0`. |
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
- Replace `approveTool()`, `rejectTool()`, and `answerToolQuestion()` calls with `respondToInteraction({ interactionId, response })`.
- Re-test custom event mappers whenever Core adds a stream event type.
- Verify stop behavior for custom transports; they must honor `AbortSignal`.
- When enabling resume, test reload, reconnect, terminal cleanup, and expired/missing server state.
- Keep smoothing lifecycle mounted long enough to drain when upgrading from preset-era versions.

Read the complete [React changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/react/CHANGELOG.md).
