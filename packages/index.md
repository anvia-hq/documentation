# Packages

Anvia is distributed as focused TypeScript packages. Install the runtime surfaces your application needs, then add provider, storage, observability, or development adapters around them.

## Start with the package catalog

The [package catalog](/packages/catalog) groups every first-party package by responsibility. Each package page includes installation, a working setup, supported patterns, compatibility notes, its public API, and a link to its release history.

If you are choosing between adapters, use the [feature matrix](/packages/feature-matrix). If you are upgrading an application, read [compatibility and versioning](/packages/compatibility-and-versioning) before the [changelog index](/packages/changelog).

## Package families

| Family | Use it for | Start here |
| --- | --- | --- |
| Core runtime | Agents, completions, streaming, server transports, and React clients | [`@anvia/core`](/packages/core) |
| Model providers | Completion, embedding, image, audio, transcription, and OCR models | [`@anvia/openai`](/packages/openai) |
| Memory | Durable agent sessions and message history | [`@anvia/memory-sqlite`](/packages/memory-sqlite) |
| Vector stores | Retrieval indexes for embedded documents | [`@anvia/pgvector`](/packages/pgvector) |
| Observability | Logs, traces, evaluations, datasets, and prompts | [`@anvia/otel`](/packages/otel) |
| Development tools | Local inspection and isolated execution | [`@anvia/studio`](/packages/studio) |

## Guides versus package reference

The [Anvia SDK documentation](/sdk/) explains how to design and build agent systems. Package pages answer narrower implementation questions: what to install, what a package exports, which runtime it supports, and how it interoperates with the rest of Anvia.

Use the guide first when learning a concept. Use Packages when selecting an adapter or checking an exact public type.

## Public API policy

API-reference pages cover public exports from the package manifest and published entry points. Files that are not exported by a package are implementation details and are intentionally excluded, even when they exist in the repository.

