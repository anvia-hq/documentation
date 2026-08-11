# Inspect a trace

Open a Studio trace to move from the complete agent run down to the exact generation or tool call that explains its behavior.

## Start with the run summary

From **Traces**, select a row. The header identifies the trace and reports:

- trace name and status;
- start time and trace ID;
- total duration;
- observation count;
- total token usage, when available;
- owning session ID.

Use this summary to separate a failed run from a slow or unexpectedly expensive successful run before examining individual observations.

## Navigate the observation tree

The left side groups the trace into the agent run, numbered turns, and observations. Expand a turn to see its model generations and tools. Nested agent and tool observations follow their recorded parent relationship.

Select any level depending on the question you are asking:

| Selection | Best for |
| --- | --- |
| `agent.run` | Reviewing the complete prompt, final output, total timing, and usage. |
| `turn.n` | Isolating work performed during one model/tool loop. |
| Generation | Inspecting the exact model request and response for a turn. |
| Tool | Checking arguments, results, skipped execution, or an error. |
| Nested agent | Following work delegated through an agent tool. |

Use **Search spans** to find an observation by its name, kind, or ID. **Collapse all** is useful when a multi-turn or multi-agent run produces a large tree.

## Inspect input and output

The detail pane changes with the selected tree item.

For an agent run, **Input** separates the instructions, conversation history, and current prompt. **Output** shows the final assistant content. For a generation, the input is the provider request assembled for that turn and the output is its response. For a tool, the input is the parsed argument value and the output is its result.

Use the payload switch to choose:

- **Formatted** for readable prompts, messages, and output;
- **JSON** for the complete structured value and metadata tree.

The JSON view is usually the better choice when checking provider fields, call IDs, dynamic tool metadata, or structured results.

## Understand errors

An error can appear at more than one level:

- a generation error means the model request failed;
- a tool error means the selected tool invocation failed;
- an agent-run error summarizes a failure that ended the run.

Select the red observation first. Read **Error**, then compare **Input** and **Metadata** to determine what was sent and which provider, model, tool, or call ID was involved.

If the trace succeeded but the answer is wrong, start with the last generation. Verify its conversation history and current prompt, then inspect the tool observations that precede it. This reveals whether the model received incorrect context or interpreted correct tool output poorly.

## Read timing and usage

Studio reports metrics only when they exist in the recorded data:

- **Duration** is elapsed time for the selected trace, turn, or observation.
- **First delta** is the delay before the first streamed model delta.
- **Usage** shows input, output, and total tokens for a trace or generation.

Turn duration is the sum of its recorded observation durations. Use it as a quick local breakdown, not as a wall-clock critical-path calculation when work overlaps.

## Use metadata to confirm configuration

Metadata complements the readable payload. Depending on the selected observation, it can include:

- agent and session identifiers;
- provider, requested model, and resolved model;
- message, document, and tool counts;
- tool names, parameter keys, call IDs, and approval behavior;
- response usage and message IDs;
- start, end, duration, and first-delta timing.

When a value is absent, Studio does not fabricate it. Check the formatted payload first, then switch to JSON when you need the original structure.

To understand adjacent runs from the same conversation, continue with [Session traces and logs](/studio/traces/session-traces-and-logs).
