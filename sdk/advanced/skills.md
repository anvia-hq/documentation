# Skills

Skills package reusable instructions, references, and scripts so an agent can load procedural guidance only when a task needs it.

## Explore skills

| Page | Learn how to |
| --- | --- |
| [Directory structure](/sdk/advanced/skills/directory) | Organize a local skill package. |
| [Write SKILL.md](/sdk/advanced/skills/content) | Define metadata and focused operating instructions. |
| [References and scripts](/sdk/advanced/skills/assets) | Add supporting files and deterministic helpers safely. |
| [Load skills](/sdk/advanced/skills/load) | Load one or more trusted skill sources. |
| [Skill tools](/sdk/advanced/skills/tools) | Understand the generated tools available to the model. |
| [Validation](/sdk/advanced/skills/validation) | Catch invalid packages before serving requests. |
| [Skills and retrieval](/sdk/advanced/skills/skills-and-retrieval) | Choose procedural guidance or factual search. |

## Progressive disclosure

```text
Skill names and descriptions
          ↓
Load relevant SKILL.md instructions
          ↓
Read one reference or run one script if needed
```

The agent initially sees a compact catalog. It can load deeper content through generated skill tools instead of placing every instruction and reference in every prompt.

## A minimal skill

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
description: Draft release notes from product changes.
---
# Release Notes

Read `references/style-guide.md` before drafting.
Use `scripts/collect-changes.sh` when change data is not supplied.
```

Load the directory and attach the resulting `SkillSet`:

```ts
import { AgentBuilder } from '@anvia/core'
import { loadSkills, skill } from '@anvia/core/skills'

const productSkills = await loadSkills(skill.local('skills'))

const agent = new AgentBuilder('release-assistant', model)
  .skills(productSkills)
  .defaultMaxTurns(4)
  .build()
```

## Choose skills for procedures

Skills answer “how should this task be performed?” Retrieval answers “which facts are relevant?” Use skills for workflows, rubrics, and operating procedures; use [Dynamic context](/sdk/advanced/dynamic-context) for a large or changing factual corpus.
