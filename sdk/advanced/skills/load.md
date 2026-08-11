# Load skills

Use `loadSkills(...)` to merge trusted skill sources into one `SkillSet`, then attach it with `.skills(...)`.

## Load local skills

```ts
import { AgentBuilder } from '@anvia/core'
import { loadSkills, skill } from '@anvia/core/skills'

const productSkills = await loadSkills(
  skill.local('skills'),
)

const agent = new AgentBuilder('release-assistant', model)
  .instructions('Use a skill when it matches the task.')
  .skills(productSkills)
  .defaultMaxTurns(4)
  .build()
```

If the path points to one skill directory, the loader returns that skill. If it points to a directory containing skills, it loads each child with a `SKILL.md`.

## Understand the result

`loadSkills(...)` returns a `SkillSet` containing:

| Member | Contains |
| --- | --- |
| `skills` | Loaded skill metadata, instructions, references, and scripts. |
| `tools` | Generated tools for loading and running skill content. |
| `instructions` | Compact catalog instructions added to the agent. |

`.skills(skillSet)` attaches the generated instruction block and tools together.

## Load multiple sources

```ts
const skillSet = await loadSkills([
  skill.local('skills/shared'),
  skill.local(`skills/environments/${environment}`),
])
```

When sources contain the same skill name, the later loader wins. Use overrides deliberately and keep the source order visible in application setup.

## Implement another trusted source

`SkillLoader` is intentionally small:

```ts
import type { SkillLoader } from '@anvia/core/skills'

const managedSkills: SkillLoader = {
  async load() {
    return skillRepository.loadApprovedSkills()
  },
}

const skillSet = await loadSkills(managedSkills)
```

The loader must return valid `Skill` objects. It also owns authentication, caching, version selection, and trust for the external source.

## Load before serving requests

Load and validate stable skills during application startup or worker initialization. Do not read the same directories for every prompt.

For tenant- or request-specific skill sets, resolve the allowed source before building the scoped agent and ensure one tenant cannot load another tenant's instructions or scripts.
