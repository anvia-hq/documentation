# What is Anvia Studio?

Anvia Studio is an optional local browser console for running, inspecting, and debugging Anvia agents and pipelines. It wraps runtime objects from your application; it does not translate them into a separate Studio format or replace the Anvia execution engine.

Register an agent or pipeline with `@anvia/studio`, start the local server, and Studio discovers the capabilities it can expose. Depending on the registered targets, the console can provide:

- A playground for real streamed agent runs.
- Agent, model, instruction, context, and runtime inspection.
- Tool schemas, direct tool invocation, approvals, and questions.
- Pipeline graphs, inputs, runs, logs, and replay.
- Local sessions and traces.
- Memory, retrieval evidence, MCP, and sandbox inspection.

These surfaces operate with the credentials and permissions of the Studio process. By default, sessions, traces, and pipeline history are kept in memory and disappear when the process restarts. SQLite can retain local development state when needed.

Studio is designed for the development loop, not retained production operations. It has no built-in user authentication, authorization, or TLS, and its routing options are not security controls. Bind it to a loopback address and use development credentials with limited authority.

Start with [Anvia Studio](/studio/), [how Studio works](/studio/how-studio-works), and [security boundaries](/studio/configure/security-boundaries). The package surface is documented under [`@anvia/studio`](/packages/studio).
