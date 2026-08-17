# Skills

Skills package reusable procedures, references, and executable helpers. They let an agent load detailed guidance only when a task matches the skill.

```text
Compact catalog
  -> load matching SKILL.md
  -> read a listed reference or script
  -> run a listed script only when needed
```

## 1. Create a minimal skill

```text
skills/
  release-notes/
    SKILL.md
    references/
      style-guide.md
    scripts/
      collect-changes.sh
```

```md
---
name: release-notes
description: Draft customer-facing release notes from product changes.
---

# Release notes

Read `references/style-guide.md` before drafting.
Use `scripts/collect-changes.sh` only when change data is not supplied.
```

## 2. Load and attach it

```ts
import { Agent } from '@anvia/core'
import { loadSkills, skill } from '@anvia/core/skills'

const productSkills = await loadSkills(
  skill.local('skills'),
)

const agent = new Agent({
  id: 'release-assistant',
  model,
  skills: productSkills,
  maxTurns: 4,
})
```

The agent receives compact catalog instructions and four generated tools for loading skill content or executing listed scripts.

## 3. Use skills for procedures

Skills answer “how should this task be performed?” Retrieval answers “which facts are relevant now?”

Use skills for workflows, rubrics, small supporting references, and reviewed deterministic helpers. Use [dynamic context](/sdk/advanced/dynamic-context) for a large or frequently changing factual corpus.

## 4. Continue through the section

- [Organize the directory](/sdk/advanced/skills/directory)
- [Write SKILL.md](/sdk/advanced/skills/content)
- [Add references and scripts](/sdk/advanced/skills/assets)
- [Load trusted skills](/sdk/advanced/skills/load)
- [Understand generated tools](/sdk/advanced/skills/tools)
- [Validate packages](/sdk/advanced/skills/validation)
- [Combine skills and retrieval](/sdk/advanced/skills/skills-and-retrieval)
