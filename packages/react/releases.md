# Releases

The reviewed source release is `@anvia/react` **1.4.0**. The entries below preserve notable v0
protocol milestones and the primitive history the package inherited when `@anvia/react-ui` was
merged into it.

## Changes in 1.4.0

Reviewed `1.3.0` → `1.4.0` against SDK source on 2026-11-26:

- `ChatProvider` accepts `transport` and any other `useChat` option and creates the chat itself; passing `controller` works as before. Read the controller with `useChatContext()`.
- `useChat` exposes `contextBreakdown`, and `ContextMeterPrimitive` passes an optional `breakdown` to its render prop.

## Changes in 1.3.0

Reviewed `1.2.0` → `1.3.0` against SDK source on 2026-11-25. `@anvia/react-ui` was merged into
`@anvia/react` and the separate package was removed:

- Every headless primitive, provider, and subpath now ships from `@anvia/react`: `./attachment`,
  `./chat`, `./completion`, `./graph-explorer`, `./human-input`, `./image`, `./message`,
  `./sandbox-terminal`, `./sandbox-desktop`, `./selection-toolbar`, `./stream`, `./shared`, and
  `./thread-list`.
- The package declares `"sideEffects": false`, so hooks-only imports tree-shake the UI
  dependencies.
- `@anvia/cli` registry templates and the installer target `@anvia/react`, and `@anvia/studio`
  imports the graph explorer and stream Markdown primitives from the same package.

Migration is a rename: `@anvia/react-ui/chat` becomes `@anvia/react/chat`, `@anvia/react-ui` becomes
`@anvia/react`, and no component API changed. Remove `@anvia/react-ui` from `package.json`.

## Changes in 1.2.0

Reviewed `1.1.5` → `1.2.0` against SDK source on 2026-11-23. Adds `useDurableChat()` and bounded `maxRetainedEvents` for both hooks.

## Changes through 1.1.5

Reviewed `1.1.4` → `1.1.5` against SDK source on 2026-11-04. Preserved detailed chat stream errors and reported them once when the stream ends with an error status. See [streaming state](/packages/react/state-and-streaming).

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/7815383f045fa45ac64534bbfcc67fcb52b70e86/packages/react/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.4.0` | `ChatProvider` accepts `transport` and `useChat` options as an alternative to `controller`; `useChat` exposes `contextBreakdown` and `ContextMeterPrimitive` passes `breakdown` to its render prop. |
| `1.3.0` | Merged the headless primitives from `@anvia/react-ui` into this package with no API change, marked the package side-effect free, and moved the CLI registry and Studio onto `@anvia/react`. |
| `1.2.0` | Added `useDurableChat()` and bounded `maxRetainedEvents` for `useChat()` and `useCompletion()`. |
| `1.1.5` | Preserved detailed chat stream errors and reported them once when the stream ended with an error status. |
| `1.0.0` | Adopted client protocol v3, persisted interaction-aware resume state, added `waiting` status, and replaced separate approval/question methods with `interactions` plus `respondToInteraction()`. |
| `1.0.11` | Added renderer-agnostic graph explorer state and headless primitives for loading, expanding, searching, selecting, refreshing, and rendering bounded `@anvia/graph` exploration results, keeping asynchronous controller ownership in React. |
| `1.0.10` | Hydrated persisted assistant usage, context usage, and sources into replayed UI messages; exposed aggregate run usage as `useChat().runUsage` and completion usage as `useCompletion().usage`. |
| `0.11.0` | Added model-aware context limits and active context usage to hook results. |
| `0.8.0` | Added resumable chat state and transport envelopes. |
| `0.7.9` | Expanded UI attachment, suggestion, tool-part, and human-input event handling for the merged primitives. |

## Merged primitives history

These releases shipped from `@anvia/react-ui`, whose final published version was `1.3.3`. They are
listed because the components and the CLI registry still build on them.

| Version | Summary |
| --- | --- |
| `1.3.3` | Rejected active URL schemes in attachment links and image sources, and refreshed dependencies. |
| `1.3.0` | Added `renderEntity` to `ComposerPrimitive.Input` to customize how a mention token displays in the editor without changing the saved text or entities. |
| `1.2.0` | Added `SandboxTerminal` and `SandboxDesktop` on their own subpaths, with optional xterm.js and noVNC peers kept off the root export. Both viewers share relay reconnection with backoff and a fresh single-use ticket per attempt; the desktop adds scaling, quality controls, and agent/viewer control handoff. |
| `1.1.5` | Showed response actions and metrics only on the final assistant response of a completed exchange, including the shared `Message.Actions` group, and aligned fallback metrics with user exchanges. |
| `1.0.0` | Renamed compound exports to explicit `*Primitive` namespaces, removed package CSS and `data-anvia-*`, standardized the semantic DOM contract on ARIA, `data-state`, and `data-role`, and aligned human-input actions with the unified pending-interaction controller. |
| `0.7.0` | Added the `ContextMeter` and model-aware active context usage display. |
| `0.6.0` | Added stable-block live Markdown rendering with lifecycle-driven text and mixed-item smoothing. |
| `0.4.0` | Replaced the default native composer input with a Tiptap rich editor and added trigger/entity metadata; `ComposerPrimitive.TextareaInput` preserves the native option. |
| `0.3.0` | Added image, selection-toolbar, and thread-list namespaces plus controlled quote state. |
| `0.1.0` | Introduced the composable primitive package. |

The last React UI changelog is available in the
[source archive](https://github.com/anvia-hq/anvia/blob/7aa42c0a16c14cd96e42e503a2dd4c68a2ba9488/packages/react-ui/CHANGELOG.md).

## Upgrade checks

- Remove `@anvia/react-ui` and rename its imports to `@anvia/react` and its subpaths, then delete the duplicate dependency.
- Align `@anvia/core`, `@anvia/server`, and `@anvia/react` when adopting protocol changes.
- Replace `approveTool()`, `rejectTool()`, and `answerToolQuestion()` calls with `respondToInteraction({ interactionId, response })`.
- Re-test custom event mappers whenever Core adds a stream event type.
- Verify stop behavior for custom transports; they must honor `AbortSignal`.
- When enabling resume, test reload, reconnect, terminal cleanup, and expired/missing server state.
- Keep smoothing lifecycle mounted long enough to drain when upgrading from preset-era versions.
- Snapshot or interaction-test design-system components used with `asChild`; forwarded refs and disabled state remain required.

Read the complete [React changelog](https://github.com/anvia-hq/anvia/blob/main/packages/react/CHANGELOG.md).
