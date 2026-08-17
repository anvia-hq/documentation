# Directory structure

Each local skill is one directory with a required `SKILL.md` file and optional `references/` and `scripts/` trees.

```text
skills/
  release-notes/
    SKILL.md
    references/
      style-guide.md
      examples/
        concise.md
    scripts/
      collect-changes.sh
```

`SKILL.md` contains metadata and operating instructions. `references/` contains read-only guides, examples, policies, or checklists. `scripts/` contains executable deterministic helpers.

## 1. Match the directory and skill name

The frontmatter name must equal the directory basename and contain lowercase letters, numbers, and single hyphens between segments:

```text
release-notes   valid
release_notes   invalid
ReleaseNotes    invalid
```

Names are limited to 64 characters and become part of the generated skill-tool contract.

## 2. Load one or several directories

```ts
const oneSkill = skill.local('skills/release-notes')
const childSkills = skill.local('skills')
```

When the target itself contains `SKILL.md`, the loader reads that one skill. Otherwise it scans the target's direct child directories and loads those containing `SKILL.md`.

Reference and script discovery is recursive inside their respective folders, and stored paths use portable forward slashes.

## 3. Keep assets contained

Generated tools reject empty and absolute paths, traversal outside `references/` or `scripts/`, and files not present in the discovered list.

This restricts which path a tool call can name. It does not make the contents of a listed reference trustworthy or a listed script safe. Load only application-controlled, reviewed directories.

## 4. Keep one recognizable capability per skill

Split unrelated procedures when they have different triggers, assets, permissions, owners, or release cycles. Keep large factual corpora outside the skill and retrieve them from an indexed knowledge source.

Next, write [SKILL.md](/sdk/advanced/skills/content).
