# What does my application still own?

Your application owns every product, security, and infrastructure decision around the Anvia runtime. Anvia coordinates model behavior; it does not become the authority for your users or data.

Application-owned responsibilities include:

- Authentication and authorization.
- Provider credentials and tenant-specific configuration.
- Business data access and mutation rules.
- Tool permissions, approval policy, and audit requirements.
- Session ownership and memory access checks.
- Document ingestion, retention, and source permissions.
- Database, queue, cache, and deployment architecture.
- User interface, error handling, and product fallbacks.
- Privacy controls for prompts, tool results, traces, and evaluations.
- Cost, latency, retry, and provider fallback policy.

Schemas validate shapes; they do not authorize actions. A memory `sessionId` selects a conversation; it does not prove the current user may read it. A model provider's safety controls do not replace application policy. Studio exposes configured local capabilities and should be treated as a trusted development surface, not as an authentication layer.

Keep these boundaries visible by constructing models and stores at the application edge, injecting them into agents, and enforcing permissions inside tools before accessing product data.

Continue with [tool security](/sdk/tools/security), [memory sessions](/sdk/memory/sessions), [Studio security boundaries](/studio/configure/security-boundaries), and [Lens retention and deletion](/lens/workspace/project-settings/retention-and-deletion).
