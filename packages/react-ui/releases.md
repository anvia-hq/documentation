# Releases

The current stable release is `@anvia/react-ui` **1.0.0**. It is strictly headless and pairs with
the `@anvia/cli` installer. The entries below preserve notable v0 history.

| Version | Summary |
| --- | --- |
| `1.0.0` | Renamed compound exports to explicit `*Primitive` namespaces, removed package CSS and `data-anvia-*`, standardized the semantic DOM contract on ARIA, `data-state`, and `data-role`, and aligned human-input actions with the unified pending-interaction controller. |
| `1.0.0-rc.9` | Synchronized the package with the Anvia 1.0 release-candidate train. |
| `0.7.1` | Published updated upstream runtime dependencies. |
| `0.7.0` | Added the `ContextMeter` and model-aware active context usage display. |
| `0.6.3` | Fixed streamed Markdown reveal state across pauses and honored reduced-motion opacity. |
| `0.6.0` | Added stable-block live Markdown rendering with lifecycle-driven text and mixed-item smoothing. |
| `0.5.0` | Added semantic composer-entity rendering in Markdown and entity customization. |
| `0.4.0` | Replaced the default native composer input with a Tiptap rich editor and added trigger/entity metadata; `ComposerPrimitive.TextareaInput` preserves the native option. |
| `0.3.0` | Added image, selection-toolbar, and thread-list namespaces plus controlled quote state. |
| `0.2.0` | Expanded chat, completion, message, attachment, suggestion, tool, and human-input primitives. |
| `0.1.0` | Introduced the composable primitive package. |

## Upgrade checks

- Align the declared `@anvia/react` peer range and React/React DOM peers before upgrading.
- Replace `Composer`, `Message`, and other compound namespaces with their `*Primitive` names.
- Remove imports of `@anvia/react-ui/styles.css` and `@anvia/react-ui/stream/styles.css`; move styling into the application or install editable components with `@anvia/cli`.
- Replace `data-anvia-*` selectors with explicit classes or the documented `data-state` and `data-role` contract.
- If moving from before `0.4.0`, choose explicitly between rich `ComposerPrimitive.Input` and `ComposerPrimitive.TextareaInput`.
- Re-test custom Markdown components and entity renderers when stream or entity behavior changes.
- Keep reduced-motion behavior intact when adding an application-owned stream reveal animation.
- Snapshot or interaction-test design-system components used with `asChild`; forwarded refs and disabled state remain required.

Read the complete [React UI changelog](https://github.com/anvia-hq/anvia/blob/main/packages/react-ui/CHANGELOG.md).
