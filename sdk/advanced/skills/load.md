# Load skills

`loadSkills()` merges one or more trusted loaders into a `SkillSet` that can be attached to an agent.

## 1. Load local skills

```ts
import { Agent } from '@anvia/core'
import { loadSkills, skill } from '@anvia/core/skills'

const productSkills = await loadSkills(
  skill.local('skills'),
)

const agent = new Agent({
  id: 'release-assistant',
  model,
  instructions: 'Use a matching skill when the task needs it.',
  skills: productSkills,
  maxTurns: 4,
})
```

The returned `SkillSet` contains loaded `skills`, generated `tools`, and compact catalog `instructions`. The agent appends those instructions to its own instructions and registers the generated tools.

An empty loader result produces empty instructions and no skill tools.

## 2. Merge multiple sources

```ts
const skillSet = await loadSkills([
  skill.local('skills/shared'),
  skill.local(`skills/environments/${environment}`),
])
```

Skills are keyed by name. A later loader replaces an earlier skill with the same name and moves that replacement to the later position. Keep override order explicit and reviewed.

## 3. Implement a custom loader

```ts
import type { SkillLoader } from '@anvia/core/skills'

const managedSkills: SkillLoader = {
  async load() {
    return skillRepository.loadApprovedSkills()
  },
}
```

`loadSkills()` trusts `Skill` objects returned by a custom loader; it does not run the local directory validator over them. The loader owns authentication, authorization, caching, version selection, asset paths, field validity, and trust.

## 4. Load at the correct lifecycle

Load stable skills during startup or worker initialization rather than for every prompt.

For request- or tenant-specific sets, resolve the allowed loaders before constructing the scoped agent. Ensure one tenant cannot select another tenant's instructions or executable assets.

Next, understand the generated [skill tools](/sdk/advanced/skills/tools).
