# Frequently asked questions

Quick answers about choosing and operating Anvia runtime primitives.

## Do I need an agent for every model call?

No. Use `createCompletion` when your application already owns a simple one-call flow. Use an agent when behavior is reused or needs tools, memory, streaming across turns, or runtime policies.

## Is Anvia tied to OpenAI?

No. Core depends on provider-neutral model interfaces. Provider packages create models for OpenAI, Anthropic, Gemini, Mistral, and other supported vendors.

## Where should provider API keys live?

On the server. Browser clients should call an application route that runs the agent and streams normalized events.

## What is the difference between completion and agent streaming?

`createCompletionStream` streams one model call. `agent.prompt(...).stream()` streams the whole runtime run, including turns, tools, final metadata, and errors.

## Why does a tool-enabled agent need multiple turns?

The model first requests the tool, the application returns its result, and the model then produces an answer. Set a turn limit that allows that sequence while still bounding work.

## Does a tool schema handle authorization?

No. Schemas validate input and output shapes. Application code must still check the current user's permission before reading data or performing an action.

## When should I use static context instead of retrieval?

Use static context for small facts that rarely change and can be sent with every request. Use retrieval for large or frequently changing knowledge bases.

## Does memory scope authorize a session?

No. Scope determines which stored thread is loaded. Authenticate the route and verify that the current user may access the requested session before calling the agent.

## Which server stream format should I use?

Use JSONL for Anvia React transports. Use SSE when an existing client requires `text/event-stream` compatibility.

## What does runtime logging include by default?

Lifecycle metadata without final outputs, full model requests and responses, or tool results. Opt into sensitive payloads only when your data policy permits them.

## How do I inspect an agent locally?

Run the agent with `@anvia/studio`, then open its playground in a browser. Studio can expose sessions, traces, tools, memory, and other configured runtime capabilities.
