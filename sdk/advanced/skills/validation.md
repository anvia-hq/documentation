# Validation

Local skill loading validates package structure and throws `SkillValidationError` with one or more path-specific issues.

## Handle validation errors

```ts
import {
  SkillValidationError,
  loadSkills,
  skill,
} from '@anvia/core/skills'

try {
  const skillSet = await loadSkills(
    skill.local('skills'),
  )
} catch (error) {
  if (error instanceof SkillValidationError) {
    for (const issue of error.issues) {
      console.error(issue.path, issue.message)
    }
  }

  throw error
}
```

Each issue contains the affected path and a readable validation message.

## What loading validates

Local validation covers:

- required frontmatter
- directory and skill-name consistency
- supported name format
- required descriptions and description limits
- discovered reference and script paths

At runtime, generated tools also reject absolute paths, path traversal, and access to unlisted assets. Script execution has a timeout and capped output.

## Validate before requests

Load skills during startup and fail clearly when a required package is invalid. Also run the same loader in CI so a broken skill does not reach deployment.

Do not catch `SkillValidationError` and silently remove a required skill. If an optional skill source may fail, report degraded capability through application status and make the omission visible to operators.

## Test behavioral quality separately

Structural validation proves the package can load; it does not prove the instructions are good. Test representative tasks for:

- correct skill selection
- correct reference selection
- scripts running only when needed
- expected output structure
- refusal to access unlisted paths
- safe handling of script failure and oversized output

Keep factual corpora out of skills when size makes skill selection or instruction loading unreliable.
