# References and scripts

References provide read-only supporting content. Scripts provide deterministic helpers the agent can run through generated skill tools.

## Add references

```text
release-notes/
  SKILL.md
  references/
    style-guide.md
    strong-example.md
    review-checklist.md
```

References work well for:

- style guides and output examples
- policies and review rubrics
- checklists and migration notes
- small tables or command references

Tell the agent which reference to read and why inside `SKILL.md`.

## Add scripts

```text
release-notes/
  scripts/
    collect-changes.sh
    normalize-input.ts
```

Scripts work well for deterministic tasks such as collecting local data, formatting structured input, linting an artifact, or generating a mechanical draft.

Do not use a script when a short instruction is enough. Do not put credentials or broad environment access inside a skill package.

## Understand containment

Generated skill tools enforce several filesystem boundaries:

- absolute paths are rejected
- path traversal is rejected
- only discovered reference and script paths can be accessed
- scripts run with a timeout
- script output is capped

These controls prevent a skill call from naming arbitrary host files. They do not review what a listed script itself does.

## Decide whether scripts are allowed

Many user-facing products should load read-only skills without executable scripts. If skill scripts are enabled, run only trusted, reviewed packages in an appropriately constrained server or worker environment.

The application owns process permissions, environment variables, network access, working directories, resource limits, and audit policy.

## Keep outputs small and safe

Script output can enter tool messages, traces, or memory. Return only the data the agent needs, redact secrets, and store large artifacts outside the transcript with a safe reference.
