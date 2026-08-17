# Write SKILL.md

`SKILL.md` combines YAML frontmatter with procedural instructions that the model can load through `get_skill_instructions`.

## 1. Add frontmatter

```md
---
name: release-notes
description: Draft customer-facing release notes from product changes.
license: MIT
metadata:
  owner: release-team
---
```

`name` and `description` are required. The name must match the directory, use the supported format, and be at most 64 characters. The description must be non-empty and at most 1,024 characters.

`license` is optional string metadata. `metadata` is an optional object retained on the loaded `Skill`. Anvia does not enforce license, tenant, visibility, or environment policy from these fields.

## 2. Write an actionable procedure

```md
# Release notes

Create release notes from the supplied product changes.

1. Read `references/style-guide.md`.
2. Group changes by user impact.
3. Exclude internal ticket IDs and unreleased security details.
4. Return Markdown with Summary, Improvements, and Fixes.

Use `scripts/collect-changes.sh` only when change data is absent.
```

State the goal, required sequence, relevant assets, safety constraints, and expected output. Prefer direct operational instructions over broad background explanation.

## 3. Make the description selective

The initial catalog contains the name and description before full instructions are loaded. Describe both the capability and its trigger.

Avoid vague text such as “Helpful release skill.” Overlapping descriptions make skill selection unpredictable.

## 4. Keep security outside skill text

Skills guide model behavior; they do not authorize users or protect side effects. Keep authentication, validation, approvals, and irreversible actions in application services and tools.

Next, add [references and scripts](/sdk/advanced/skills/assets).
