# Skill tools

When at least one skill is loaded, Anvia creates four tools for progressive disclosure.

`get_skill_instructions` loads the complete instructions for one skill.

`get_skill_reference` reads one discovered reference path.

`get_skill_script` reads one discovered script as text.

`run_skill_script` executes one discovered script with optional string arguments and timeout.

## 1. Understand the initial catalog

The agent initially sees each skill's name, description, reference paths, and script paths, plus descriptions of the four generated tools. Full file bodies remain unloaded.

```text
Task
  -> choose a skill from name and description
  -> get_skill_instructions
  -> read a directed reference or script
  -> run a script only when execution is required
```

## 2. Attach the complete set

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

const response = await agent.generate({
    prompt: 'Draft release notes for the streaming improvements.'
})
```

`skills: productSkills` attaches catalog instructions and tools together. You may register `skillSet.tools` manually, but then you must also decide how the model learns the catalog.

## 3. Keep the catalog selective

Load only skills appropriate for the agent role and environment. Too many overlapping descriptions add tool context and make selection ambiguous.

## 4. Treat generated tools as a privileged boundary

Path containment prevents arbitrary requested paths, but listed scripts still execute with process permissions. Generated skill tools are specially marked and their outputs do not pass through ordinary `onToolOutput` middleware.

Review all loaded content, restrict executable skill sources, avoid sensitive output, and filter runtime events before sending them to users.

Next, verify package [validation](/sdk/advanced/skills/validation).
