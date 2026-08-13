# Skill tools

When at least one skill is loaded, Anvia creates four tools that let the model progressively access skill content.

## Generated tools

| Tool | Purpose |
| --- | --- |
| `get_skill_instructions` | Load the complete `SKILL.md` instructions for one skill. |
| `get_skill_reference` | Read one listed file under `references/`. |
| `get_skill_script` | Read one listed file under `scripts/`. |
| `run_skill_script` | Execute one listed skill script. |

These tools are included in the `SkillSet` and attached through the `skills` option.

## What the agent sees first

The generated instruction block lists skill names, descriptions, reference paths, and script paths. The full bodies remain unloaded until the model calls the relevant tool.

```text
User task
  → select skill by name and description
  → get_skill_instructions
  → get_skill_reference or get_skill_script when directed
  → run_skill_script only when execution is needed
```

This keeps unrelated skill content out of the model context.

## Attach the complete skill set

```ts
const productSkills = await loadSkills(skill.local('skills'))

const agent = new Agent({
  id: 'release-assistant',
  model: model,
  instructions: 'Use skills when they are relevant to the task.',
  skills: productSkills,
  maxTurns: 4,
})

const response = await agent
  .prompt(
    'Draft release notes for the streaming and retrieval improvements.',
  )
  .send()
```

The model may load the release-note instructions, then read a style guide or run a listed helper if the skill directs it to do so.

## Keep the catalog selective

Descriptions should make skill choice clear. Too many overlapping skills make selection ambiguous and add model-facing tool context.

Load only skills appropriate for the current agent role and environment. A loaded skill exposes its catalog entry and generated access paths to that agent.

## Treat script execution as a tool boundary

Containment prevents arbitrary paths, but `run_skill_script` still executes reviewed code. Do not load executable skill packages into a runtime that should be read-only. Keep secrets out of script output and apply normal tool-event filtering to user-facing streams.
