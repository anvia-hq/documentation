# Add Anvia to your coding agent

Give Claude Code, Cursor, Codex, or any agent that reads `AGENTS.md` current Anvia knowledge before
it writes code. Install the bundled Agent Skills with the CLI, or point the agent at the curated
LLM text guides.

## Install Agent Skills

Run the CLI from your project directory. It copies the skills into `skills/<name>/` and connects
the coding agents you select:

```sh
pnpm dlx @anvia/cli skills init --claude --cursor --codex
```

| Flag | What it adds |
| --- | --- |
| `--claude` | A self-contained copy in `.claude/skills/<name>/` for Claude Code |
| `--cursor` | One rule per skill in `.cursor/rules/`, pointing to the canonical `SKILL.md` |
| `--codex` or `--agents` | An Anvia section in `AGENTS.md` that lists the skills and how to read them |

Each skill has a `SKILL.md` entrypoint, supporting `references/`, and example or verification
`scripts/`. Installing copies files only; it does not run the scripts or start an agent.

## What the skills cover

| Skill | Use it for |
| --- | --- |
| `anvia-agent` | Agents, tools, approvals, memory, streaming, teams, and providers |
| `anvia-chat` | Server routes, transports, React hooks, and chat UI primitives |
| `anvia-rag` | Chunking, embeddings, vector stores, knowledge graphs, and retrieval |
| `anvia-mcp` | MCP clients, transports, tool discovery, and URL safety |
| `anvia-pipeline` | Sequential, parallel, batch, and agent pipeline stages |
| `anvia-durable` | Experimental durable agents, replay-safe effects, persisted waits, and task graphs |
| `anvia-channels` | Discord, Slack, Telegram, sessions, and proactive delivery |
| `anvia-evals` | Deterministic metrics, model judges, RAG checks, and CI evaluation |
| `anvia-studio` | Serving and inspecting agents, traces, approvals, and observability |

## Keep skills current

Skills are compared with the bundle in the CLI release you run. Preview changes first, then apply
the same target selection:

```sh
pnpm dlx @anvia/cli skills update --claude --cursor --codex
pnpm dlx @anvia/cli skills update --claude --cursor --codex --apply
```

Review or commit local edits to skill files before applying an update. The comparison cannot
tell a customization from an older bundled file.

## Use the LLM text guides

For agents that fetch documentation instead of reading local files, start from the index and
choose the narrowest topic guide:

- [llms.txt](/llms.txt): Index of the documentation, stable v1 boundaries, and topic guides.
- [Agents, tools, and MCP](/llms-agents.txt): Models, agents, tools, MCP, skills, multi-agent coordination, pipelines, sandboxing, and streaming.
- [Full-stack applications](/llms-apps.txt): Server streaming, React client state, headless UI, authentication, cancellation, and resumption.
- [Evaluations and observability](/llms-evals.txt): Tracing, Lens, runtime scoring, evaluation suites, datasets, and quality gates.
- [RAG and retrieval](/llms-rag.txt): Ingestion, embeddings, vector stores, GraphRAG, metadata filters, and permission-aware retrieval.

## Go deeper

- [CLI get started](/packages/cli/get-started): Run the CLI and choose skills or component installation.
- [Agent Skills reference](/packages/cli/agent-skills): Directories, integrations, and update behavior.
- [Runtime skills](/sdk/advanced/skills): Load skills into an Anvia agent at runtime, a separate step from coding-agent installation.
