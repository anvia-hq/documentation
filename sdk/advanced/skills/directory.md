# Directory structure

Each local skill is a directory containing one required `SKILL.md` and optional supporting folders.

## Directory shape

```text
skills/
  release-notes/
    SKILL.md
    references/
      style-guide.md
      examples.md
    scripts/
      collect-changes.sh
      format-output.ts
```

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Required metadata and operating instructions. |
| `references/` | Read-only guides, examples, policies, and checklists. |
| `scripts/` | Executable deterministic helpers. |

Keep unrelated product documentation and large factual corpora outside the skill. Those belong in retrieval or ordinary application storage.

## Name the directory consistently

The frontmatter `name` must match the skill directory name. Use lowercase letters, numbers, and hyphens:

```text
release-notes       ✓
release_notes       ✗
ReleaseNotes        ✗
```

A stable name becomes part of the generated skill-tool contract, so avoid renaming published skills casually.

## Load one or many skills

Point `skill.local(...)` at one skill directory:

```ts
const releaseNotes = skill.local('skills/release-notes')
```

Or point it at a parent directory containing several child skills:

```ts
const productSkills = skill.local('skills')
```

The parent-directory loader discovers child directories that contain `SKILL.md`.

## Keep assets inside the skill

Reference and script paths are resolved within the skill directory. Generated tools reject absolute paths, traversal outside the directory, and access to files that were not discovered as part of the skill.

This containment reduces accidental file access, but it does not make arbitrary scripts safe. Only load skill directories controlled and reviewed by your application.

## Keep the package focused

One skill should describe one recognizable capability. Split unrelated workflows when they need different descriptions, assets, permissions, or release cycles. Keep closely coupled instructions and small supporting assets together so the agent can understand the workflow without loading another skill.
