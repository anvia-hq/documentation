# Releases

The current source manifest is `@anvia/react-ui` **1.0.0-rc.2**. The entries below preserve notable v0 history.

| Version | Summary |
| --- | --- |
| `1.0.0-rc.2` | Synchronized the package with the Anvia 1.0 release-candidate train. |
| `0.7.1` | Published updated upstream runtime dependencies. |
| `0.7.0` | Added the `ContextMeter` and model-aware active context usage display. |
| `0.6.3` | Fixed streamed Markdown reveal state across pauses and honored reduced-motion opacity. |
| `0.6.0` | Added stable-block live Markdown rendering with lifecycle-driven text and mixed-item smoothing. |
| `0.5.0` | Added semantic composer-entity rendering in Markdown and entity customization. |
| `0.4.0` | Replaced the default native composer input with a Tiptap rich editor and added trigger/entity metadata; `Composer.TextareaInput` preserves the native option. |
| `0.3.0` | Added image, selection-toolbar, and thread-list namespaces plus controlled quote state. |
| `0.2.0` | Expanded chat, completion, message, attachment, suggestion, tool, and human-input primitives. |
| `0.1.0` | Introduced the composable primitive package. |

## Upgrade checks

- Align the declared `@anvia/react` peer range and React/React DOM peers before upgrading.
- If moving from before `0.4.0`, choose explicitly between rich `Composer.Input` and `Composer.TextareaInput`.
- Re-test custom Markdown components and entity renderers when stream or entity behavior changes.
- Keep reduced-motion behavior intact when overriding the stream stylesheet.
- Snapshot or interaction-test design-system components used with `asChild`; forwarded refs and disabled state remain required.

Read the complete [React UI changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/react-ui/CHANGELOG.md).
