# Validation

The local loader validates `SKILL.md` structure and throws `SkillValidationError` with path-specific issues.

## 1. Report validation issues

```ts
import {
  SkillValidationError,
  loadSkills,
  skill,
} from '@anvia/core/skills'

try {
  await loadSkills(skill.local('skills'))
} catch (error) {
  if (error instanceof SkillValidationError) {
    for (const issue of error.issues) {
      console.error(issue.path, issue.message)
    }
  }

  throw error
}
```

## 2. Know what local loading validates

`SKILL.md` must begin and end YAML frontmatter correctly. Frontmatter must be an object with a valid required name and description.

The name must match the directory, use lowercase letters, numbers, and hyphens, and fit the 64-character limit. The description is limited to 1,024 characters.

The loader discovers regular files recursively under `references/` and `scripts/`. Missing optional asset directories are valid.

Runtime tools separately enforce contained, listed asset paths and script timeout and output limits.

## 3. Validate before serving

Load required skills during startup and run the same loader in CI. Do not silently remove a required invalid skill.

When an optional source fails, expose the degraded capability to operators instead of pretending the full catalog loaded.

## 4. Test behavior separately

Structural validation does not prove useful or safe instructions. Test correct skill and reference selection, script execution only when needed, expected output shape, path rejection, script failure, timeout, truncation, and client-event redaction.

Custom `SkillLoader` results are trusted and require their own validation.

Next, choose between [skills and retrieval](/sdk/advanced/skills/skills-and-retrieval).
