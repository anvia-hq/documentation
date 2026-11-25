# Which runtimes are supported?

Anvia packages run on Node.js, and Bun 1.3.14 is a tested and supported baseline for the core runtime, transport, main provider, MCP, SQLite memory, and sandbox packages. Deno, Cloudflare Workers, and other edge runtimes are not tested or claimed as supported.

## Node.js versions

Packages without an `engines` field do not declare a minimum Node.js version. These packages do:

| Package | Minimum Node.js |
| --- | --- |
| `@anvia/mcp` | 20 |
| `@anvia/studio`, `@anvia/sandbox` | 20.12 |
| `@anvia/cli` | 20.18.1 |
| `@anvia/pinecone` | 22 |
| `@anvia/durable` | 22.16 (required by its SQLite store) |
| `@anvia/lens` | 24 |
| Channels packages | 24 |

## Bun

Bun 1.3.14 is the tested baseline. The SDK's CI runs a Bun compatibility suite on Bun 1.3.14 and the latest Bun 1.x, including installation from packed package artifacts. It covers:

- `@anvia/core`, `@anvia/client`, and `@anvia/server` (JSONL and SSE through `Bun.serve`, resumable replay, and cancellation);
- `@anvia/openai`, `@anvia/anthropic`, `@anvia/gemini`, and `@anvia/mistral`;
- `@anvia/mcp`, including the HTTP/SSE and stdio transports;
- `@anvia/memory-sqlite`, which uses `bun:sqlite` on Bun;
- `@anvia/sandbox`.

The suite builds `@anvia/durable` but does not test it on Bun. Other packages are not covered by the Bun suite, including Grok, Azure, Jev, Studio, Lens, React with its headless primitives, graph, vector, and Postgres, Drizzle, or Prisma adapters. Test those under Bun before you depend on them.

The SDK repository itself is still developed with pnpm on Node.js; Bun support applies to applications that consume the published packages.

## Edge and other runtimes

`@anvia/server` uses standard `Response`, `ReadableStream`, `TextEncoder`, and `Headers` APIs, but Anvia does not test or claim support for Deno, Cloudflare Workers, or other edge runtimes. Features such as MCP `stdio`, SQLite stores, sandboxes, and Studio also need process, file, or native APIs that these runtimes may not provide.

See [compatibility and versioning](/packages/compatibility-and-versioning) and [`@anvia/server` runtime compatibility](/packages/server#runtime-compatibility).

Reviewed against Anvia SDK `7aa42c0a` on 2026-11-24.
