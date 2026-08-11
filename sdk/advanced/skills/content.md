# Write SKILL.md

`SKILL.md` combines required frontmatter with the procedural instructions an agent loads when it selects the skill.

## Add required frontmatter

```md
---
name: release-notes
description: Draft release notes from product changes.
---
```

| Field | Requirement |
| --- | --- |
| `name` | Required; must match the directory and use the supported name format. |
| `description` | Required; tells the agent when the skill is relevant. |
| `license` | Optional metadata exposed on the loaded skill. |
| `metadata` | Optional application-owned metadata. |

Anvia exposes optional metadata but does not enforce your product's license, visibility, tenant, or environment policy.

## Write actionable instructions

```md
# Release Notes

Create release notes from the supplied product changes.

1. Read `references/style-guide.md`.
2. Group changes by user impact.
3. Do not include internal ticket IDs or unreleased security details.
4. Return Markdown with Summary, Improvements, and Fixes sections.

Use `scripts/collect-changes.sh` only when the request does not include change data.
```

State the goal, required sequence, allowed supporting files, safety constraints, and expected output. Prefer direct instructions over background explanation.

## Write a useful description

The description appears in the compact skill catalog before the full instructions are loaded. It should identify both the capability and the trigger.

```yaml
description: Draft customer-facing release notes from product changes.
```

Avoid descriptions such as “Helpful release skill.” They do not give the model enough information to select the skill reliably.

## Point to assets explicitly

Name the relevant reference or script and explain when to use it. The model can see listed asset paths, but it should not have to guess which file contains the required policy or example.

Keep large examples and detailed rubrics in `references/` so `SKILL.md` remains a focused workflow rather than another factual corpus.

## Avoid hidden product policy

Skills guide model behavior. They are not a security boundary. Keep authorization, input validation, approvals, and irreversible side effects in tools, hooks, and application services.
