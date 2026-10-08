# Agent Skills

::: info Upcoming CLI release
The `ui` command group and update `--apply` flag describe the reviewed development CLI and are
pending publication. Published CLI `1.3.0` uses the [legacy commands](/packages/cli/releases#published-cli-1-3-0).
To try these examples now, use the [development build](/packages/cli/get-started#try-the-development-build).
:::


The CLI bundles Anvia knowledge for a developer's coding agent. Each skill has a `SKILL.md`
entrypoint, supporting `references/`, and verification or example `scripts/`. Installing a skill
copies these files; it does not execute the scripts or start an Anvia agent.

## Bundled skills

The reviewed CLI includes these nine skills:

| Skill | Use it for |
| --- | --- |
| `anvia-agent` | Agents, tools, approvals, memory, streaming, teams, and providers |
| `anvia-chat` | Server routes, transports, React hooks, and chat UI primitives |
| `anvia-channels` | Discord, Slack, Telegram, sessions, and proactive delivery |
| `anvia-evals` | Deterministic metrics, model judges, RAG checks, and CI evaluation |
| `anvia-mcp` | MCP clients, transports, tool discovery, and URL safety |
| `anvia-pipeline` | Sequential, parallel, batch, and agent pipeline stages |
| `anvia-rag` | Chunking, embeddings, vector stores, knowledge graphs, and retrieval |
| `anvia-studio` | Serving and inspecting agents, traces, approvals, and observability |
| `release-notes` | A generic release-note drafting demo |

```sh
anvia skills list
```

`list` prints bundled names, rather than inspecting installed files. The CLI has no per-skill
installation flag.

## Install the canonical files

```sh
anvia skills init
```

The default layout is:

```text
skills/
  anvia-agent/
    SKILL.md
    references/
    scripts/
  anvia-chat/
    SKILL.md
    references/
    scripts/
  ...
```

Run this from any project directory. React, `components.json`, and shadcn initialization are not
required. Script executable permissions are preserved where the filesystem supports them.
Running `init` again fills missing files and keeps differing existing files unless you use
`--force`. Files that are no longer in the bundle are not deleted.

## Connect your coding agent

Target flags add integrations alongside the canonical skill copy:

| Flag | Output | How it connects the agent |
| --- | --- | --- |
| None | `skills/<name>/` | Your agent can read each `SKILL.md` directly |
| `--claude` | `.claude/skills/<name>/` | A separate, self-contained copy for Claude Code |
| `--cursor` | `.cursor/rules/<name>.mdc` | One rule per bundled skill, pointing to the canonical `SKILL.md`; `alwaysApply: false` |
| `--agents` | `AGENTS.md` | A section listing the skills and how to read them |
| `--codex` | `AGENTS.md` | An alias for the AGENTS.md integration; it does not create `.codex/skills/` |

```sh
anvia skills init --claude --cursor --codex
```

The AGENTS.md integration owns the section between `<!-- anvia-skills:start -->` and
`<!-- anvia-skills:end -->`. It preserves content outside a valid marker pair. If the markers
are absent, it appends a section; if the file is absent, it creates it. Keep project-specific
instructions outside the generated section.

## Choose another directory

```sh
anvia skills init --dir agent-skills --cwd ./my-project --cursor --agents
```

The canonical files now live in `my-project/agent-skills/`. Cursor rules and the AGENTS.md
section point to `agent-skills/<name>/SKILL.md`. The Claude copy still lives under
`my-project/.claude/skills/`.

Use the same `--dir` and `--cwd` values on later updates. Changing `--dir` selects a different
destination; it does not move or remove the previous copy. Updating differing Cursor pointers
requires `--apply`.

## Update skills and integrations

Preview the canonical copy and selected integrations:

```sh
anvia skills update --claude --cursor --codex
```

The preview lists paths that would change and writes nothing, including `AGENTS.md`. Apply the
same selection explicitly:

```sh
anvia skills update --claude --cursor --codex --apply
```

Target choices are not saved. Without flags, updates only visit the canonical copy. Comparisons
use the skills bundled with the CLI build you run.

| Target | Preview | With `--apply` |
| --- | --- | --- |
| Canonical and Claude skill trees | List differing and missing files inside installed skills | Replace differing files and restore missing files within installed skills |
| Cursor rules | List differing and missing rules | Replace differing rules and create missing rules for all bundled skills |
| AGENTS.md / Codex | Report a pending generated section without writing | Create or refresh the generated section, preserving surrounding instructions |

`skills update --force` remains a compatibility alias for `--apply`. During installation,
`skills init --force` still allows replacing differing skill files and Cursor rules.

For skill trees, a skill counts as installed when at least one file expected by the bundle exists.
Removing an entire skill directory prevents `update`, including `--apply`, from reinstalling it.
Run `skills init` to restore it. Cursor rules and the AGENTS.md list are generated from all bundled
names, so they can still point to a skill directory you removed.

The comparison cannot tell a local customization from an older bundled file: both differ from
the current bundle. Review or commit your changes before using `--apply`.

## Use the files in an Anvia runtime

For an application that deliberately loads these skills into an Anvia agent, the Core skill loader
can read the canonical directory:

```ts anvia-check
import { loadSkills, skill } from '@anvia/core/skills'

const skills = await loadSkills(skill.local('./skills'))
console.log(skills.skills.map((entry) => entry.name))
```

Installing files for a coding agent and enabling skills in an application runtime are separate
steps. Continue with [runtime skills](/sdk/advanced/skills) for loading and agent configuration,
or the [CLI API reference](/packages/cli/api-reference) for programmatic installation.
