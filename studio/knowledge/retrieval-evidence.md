# Retrieval evidence

The Retrieval Log shows the documents and tool definitions recorded on individual model generations. Use it to answer the most important retrieval-debugging question: **what did the model actually receive for this turn?**

Open `http://localhost:4021/ui/knowledge/retrieval-log`.

## Generate evidence

Evidence comes from Studio traces, so first run the agent through the [Playground](/studio/playground) or another path that records traces in Studio's trace store. Then refresh the Retrieval Log.

Each entry represents a generation observation and shows:

- observation name and turn number;
- the query inferred from the current prompt, or the latest available history message;
- document and tool counts;
- a preview of up to two recorded documents;
- all recorded tool names;
- a **Trace** action for the complete run.

Entries are created only for generation observations whose recorded input contains at least one document or tool. An empty log can therefore mean there are no recorded traces, the trace store cannot list traces, or recent generations contained neither field.

## Interpret the evidence carefully

The log reads the model-facing `documents` and `tools` arrays from the recorded generation input. That is stronger evidence than source inventory, but it also means the log is not limited to semantically retrieved items:

- documents may include static context as well as dynamically retrieved context;
- tools may include static, dynamic, and MCP-backed definitions;
- the compact log records tool names, not whether the model called them;
- the inferred query is a debugging summary, not a stored similarity-search request.

To verify the origin of a definition, compare it with [Dynamic tools](/studio/knowledge/dynamic-tools), [Tools](/studio/tools), or [MCP](/studio/mcp). To verify execution, open the trace and select the tool observation.

## Follow an entry into its trace

Select **Trace** to open the associated run. The trace provides the complete structured generation input and output, observation hierarchy, model metadata, timing, usage, tool calls, and errors.

A reliable diagnosis usually follows this sequence:

```text
Expected item exists in source
            ↓
Item appears in generation evidence
            ↓
Model chooses a tool or writes an answer
            ↓
Trace confirms result, failure, and final response
```

If the expected item exists in the source but not in the generation, investigate retrieval policy. If it appears in the generation but the model ignores it, investigate instructions, formatting, competing context, and the model response. If a tool definition appears but has no tool observation, the model had the capability but did not call it.

## Understand retention

The Retrieval Log is derived from recent traces available to Studio. The default in-memory store loses evidence when the process stops. A persistent Studio store retains traces across restarts according to your application's storage and cleanup policy.

Treat recorded prompts, documents, tool definitions, and results as potentially sensitive development data. Use test inputs where possible and apply the same access and retention discipline you use for traces. Continue to [Inspect a trace](/studio/traces/inspect-a-trace) for the full observation workflow.
