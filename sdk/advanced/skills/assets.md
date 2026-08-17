# References and scripts

References provide read-only supporting content. Scripts provide reviewed executable helpers.

## 1. Add focused references

```text
release-notes/
  references/
    style-guide.md
    strong-example.md
    review-checklist.md
```

References work well for small style guides, examples, policies, rubrics, checklists, and command notes. Tell the model which file to read and why inside `SKILL.md`.

## 2. Add executable scripts

```text
release-notes/
  scripts/
    collect-changes.sh
    normalize-input.ts
```

`run_skill_script` launches the discovered file directly with `shell: false`, the skill directory as its working directory, and no standard input. The file must be executable and have an appropriate shebang or native executable format.

Arguments are passed as separate strings. The default timeout is 30 seconds, and the caller may request a positive timeout. Standard output and error are captured and capped at approximately 20,000 characters each before a truncation marker.

Non-zero exit, signal exit, spawn failure, and timeout reject the tool call.

## 3. Understand the containment boundary

Generated tools allow only discovered paths inside the selected skill's `references/` or `scripts/` directory. They reject absolute paths and traversal.

Containment does not inspect script behavior. A listed script still inherits the server process's filesystem, environment, and network permissions.

Run executable skills only from trusted packages in a constrained worker or server environment. Keep credentials out of the package and return only the output the model needs.

## 4. Plan for transcript exposure

Reference and script results become tool messages and may appear in streams, traces, memory, or error text. Generated skill-tool results bypass normal tool-output middleware, so do not rely on middleware to redact them.

Review assets before loading, keep outputs small, and project public stream events explicitly.

Next, [load skills](/sdk/advanced/skills/load).
