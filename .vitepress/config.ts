import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Anvia',
  description: 'Documentation for Anvia',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap' }],
    ['meta', { name: 'theme-color', content: '#050505' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Anvia SDK', link: '/sdk/' },
      { text: 'Studio', link: '/studio/' },
      { text: 'Lens', link: '/lens/' },
      { text: 'Packages', link: '/packages/' },
      { text: 'FAQs', link: '/faqs/' }
    ],
    sidebar: {
      '/sdk/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Introduction', link: '/sdk/' },
            { text: 'Install and setup', link: '/sdk/install-and-setup' },
            { text: 'Your first agent', link: '/sdk/your-first-agent' }
          ]
        },
        {
          text: 'Foundations',
          items: [
            {
              text: 'Models',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/models' },
                { text: 'Completion', link: '/sdk/models/completion' },
                { text: 'Embeddings', link: '/sdk/models/embeddings' },
                { text: 'Image generation', link: '/sdk/models/image-generation' },
                { text: 'Audio generation', link: '/sdk/models/audio-generation' },
                { text: 'Transcription', link: '/sdk/models/transcription' },
                { text: 'OCR', link: '/sdk/models/ocr' }
              ]
            },
            {
              text: 'Completions',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/completions' },
                { text: 'Create a completion', link: '/sdk/completions/create' },
                { text: 'Completion result', link: '/sdk/completions/result' },
                { text: 'When to use', link: '/sdk/completions/when-to-use' }
              ]
            },
            {
              text: 'Agents',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/agents' },
                { text: 'Build an agent', link: '/sdk/agents/build' },
                { text: 'Stable behavior', link: '/sdk/agents/stable-behavior' },
                { text: 'Instructions', link: '/sdk/agents/instructions' },
                { text: 'Context', link: '/sdk/agents/context' },
                { text: 'Per-run controls', link: '/sdk/agents/per-run-controls' },
                { text: 'Runtime lifecycle', link: '/sdk/agents/runtime-lifecycle' },
                { text: 'Errors and limits', link: '/sdk/agents/errors-and-limits' }
              ]
            },
            {
              text: 'Messages',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/messages' },
                { text: 'Message roles', link: '/sdk/messages/roles' },
                { text: 'Content types', link: '/sdk/messages/content' },
                { text: 'Documents', link: '/sdk/messages/documents' },
                { text: 'Tool call', link: '/sdk/messages/tools' },
                { text: 'Reasoning', link: '/sdk/messages/reasoning' },
                { text: 'Transcripts', link: '/sdk/messages/transcripts' }
              ]
            },
            {
              text: 'Tools',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/tools' },
                { text: 'Define a tool', link: '/sdk/tools/define' },
                { text: 'Validation and execution', link: '/sdk/tools/validation-and-execution' },
                { text: 'Add tools to an agent', link: '/sdk/tools/add-to-an-agent' },
                { text: 'Tool results', link: '/sdk/tools/results' },
                { text: 'Middleware', link: '/sdk/tools/middleware' },
                { text: 'Security', link: '/sdk/tools/security' }
              ]
            },
            {
              text: 'Memory',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/memory' },
                { text: 'Configure memory', link: '/sdk/memory/configure' },
                { text: 'Sessions', link: '/sdk/memory/sessions' },
                { text: 'Save policies', link: '/sdk/memory/save-policies' },
                { text: 'Compaction', link: '/sdk/memory/compaction' },
                { text: 'Store adapters', link: '/sdk/memory/store-adapters' },
                { text: 'Custom stores', link: '/sdk/memory/custom-stores' }
              ]
            },
            {
              text: 'Knowledges',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/knowledges' },
                { text: 'Load documents', link: '/sdk/knowledges/load-documents' },
                { text: 'Embeddings', link: '/sdk/knowledges/embeddings' },
                { text: 'Vector stores', link: '/sdk/knowledges/vector-stores' },
                { text: 'Metadata filters', link: '/sdk/knowledges/metadata-filters' },
                { text: 'Automatic retrieval', link: '/sdk/knowledges/automatic-retrieval' },
                { text: 'Search tools', link: '/sdk/knowledges/search-tools' }
              ]
            },
            {
              text: 'Structured output',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/structured-output' },
                { text: 'Schema design', link: '/sdk/structured-output/schema-design' },
                { text: 'Parsed completion', link: '/sdk/structured-output/parsed-completion' },
                { text: 'Agent output', link: '/sdk/structured-output/agent-output' },
                { text: 'Extractors', link: '/sdk/structured-output/extractors' },
                { text: 'Validation errors', link: '/sdk/structured-output/validation-errors' },
                { text: 'Choose a primitive', link: '/sdk/structured-output/choose-a-primitive' }
              ]
            },
            {
              text: 'Pipelines',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/pipelines' },
                { text: 'Typed input', link: '/sdk/pipelines/typed-input' },
                { text: 'Steps', link: '/sdk/pipelines/steps' },
                { text: 'Agents and extractors', link: '/sdk/pipelines/agents-and-extractors' },
                { text: 'Composition', link: '/sdk/pipelines/composition' },
                { text: 'Parallel and batch', link: '/sdk/pipelines/parallel-and-batch' },
                { text: 'Runs and errors', link: '/sdk/pipelines/runs-and-errors' },
                { text: 'Production workers', link: '/sdk/pipelines/production-workers' }
              ]
            },
            {
              text: 'Streaming',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/streaming' },
                { text: 'Completion streams', link: '/sdk/streaming/completion-streams' },
                { text: 'Agent streams', link: '/sdk/streaming/agent-streams' },
                { text: 'Event types', link: '/sdk/streaming/event-types' },
                { text: 'Server transport', link: '/sdk/streaming/server-transport' },
                { text: 'Errors and cancellation', link: '/sdk/streaming/errors-and-cancellation' },
                { text: 'Resumable streams', link: '/sdk/streaming/resumable-streams' }
              ]
            }
          ]
        },
        {
          text: 'Advanced',
          items: [
            {
              text: 'Dynamic context',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/dynamic-context' },
                { text: 'Add context', link: '/sdk/advanced/dynamic-context/add-context' },
                { text: 'Formatting', link: '/sdk/advanced/dynamic-context/formatting' },
                { text: 'Filters and permissions', link: '/sdk/advanced/dynamic-context/filters' },
                { text: 'Multiple indexes', link: '/sdk/advanced/dynamic-context/multiple-indexes' }
              ]
            },
            {
              text: 'Hooks and run control',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/hooks' },
                { text: 'Create a hook', link: '/sdk/advanced/hooks/create' },
                { text: 'Hook points', link: '/sdk/advanced/hooks/hook-points' },
                { text: 'Cancellation', link: '/sdk/advanced/hooks/cancellation' },
                { text: 'Tool control', link: '/sdk/advanced/hooks/tool-control' },
                { text: 'Hooks and middleware', link: '/sdk/advanced/hooks/middleware' },
                { text: 'Production guidance', link: '/sdk/advanced/hooks/production-guidance' }
              ]
            },
            {
              text: 'Multi-agent systems',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/multi-agent' },
                { text: 'Agent as a tool', link: '/sdk/advanced/multi-agent/agent-as-tool' },
                { text: 'Child events', link: '/sdk/advanced/multi-agent/child-events' },
                { text: 'Memory boundaries', link: '/sdk/advanced/multi-agent/memory' },
                { text: 'Coordination', link: '/sdk/advanced/multi-agent/coordination' },
                { text: 'Failures and limits', link: '/sdk/advanced/multi-agent/failures' },
                { text: 'When not to use', link: '/sdk/advanced/multi-agent/when-not-to-use' },
                { text: 'Production checklist', link: '/sdk/advanced/multi-agent/production-checklist' }
              ]
            },
            {
              text: 'MCP',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/mcp' },
                { text: 'Connect a server', link: '/sdk/advanced/mcp/connect' },
                { text: 'HTTP and SSE', link: '/sdk/advanced/mcp/transports' },
                { text: 'Result mapping', link: '/sdk/advanced/mcp/results' },
                { text: 'Trust boundaries', link: '/sdk/advanced/mcp/security' },
                { text: 'Local tools', link: '/sdk/advanced/mcp/local-tools' },
                { text: 'Observability', link: '/sdk/advanced/mcp/observability' },
                { text: 'MCP checklist', link: '/sdk/advanced/mcp/checklist' }
              ]
            },
            {
              text: 'Skills',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/skills' },
                { text: 'Directory structure', link: '/sdk/advanced/skills/directory' },
                { text: 'Write SKILL.md', link: '/sdk/advanced/skills/content' },
                { text: 'References and scripts', link: '/sdk/advanced/skills/assets' },
                { text: 'Load skills', link: '/sdk/advanced/skills/load' },
                { text: 'Skill tools', link: '/sdk/advanced/skills/tools' },
                { text: 'Validation', link: '/sdk/advanced/skills/validation' },
                { text: 'Skills and retrieval', link: '/sdk/advanced/skills/skills-and-retrieval' }
              ]
            },
            {
              text: 'Dynamic tools',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/dynamic-tools' },
                { text: 'Tool sets', link: '/sdk/advanced/dynamic-tools/tool-sets' },
                { text: 'Tool index', link: '/sdk/advanced/dynamic-tools/index' },
                { text: 'Embedding text', link: '/sdk/advanced/dynamic-tools/embedding-text' },
                { text: 'Static and dynamic', link: '/sdk/advanced/dynamic-tools/static-and-dynamic' },
                { text: 'Safety', link: '/sdk/advanced/dynamic-tools/safety' },
                { text: 'Checklist', link: '/sdk/advanced/dynamic-tools/checklist' }
              ]
            },
            {
              text: 'Think tool',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/think-tool' },
                { text: 'Add the tool', link: '/sdk/advanced/think-tool/add' },
                { text: 'How it works', link: '/sdk/advanced/think-tool/how-it-works' },
                { text: 'When to use', link: '/sdk/advanced/think-tool/when-to-use' },
                { text: 'Instructions', link: '/sdk/advanced/think-tool/instructions' },
                { text: 'Privacy and visibility', link: '/sdk/advanced/think-tool/privacy' },
                { text: 'Production checklist', link: '/sdk/advanced/think-tool/checklist' }
              ]
            },
            {
              text: 'Parallel and batch',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/parallel-and-batch' },
                { text: 'Parallel branches', link: '/sdk/advanced/parallel-and-batch/parallel' },
                { text: 'Batch runs', link: '/sdk/advanced/parallel-and-batch/batch' },
                { text: 'Concurrency limits', link: '/sdk/advanced/parallel-and-batch/concurrency' },
                { text: 'Failures and results', link: '/sdk/advanced/parallel-and-batch/failures' },
                { text: 'Long-running jobs', link: '/sdk/advanced/parallel-and-batch/jobs' },
                { text: 'Retries and idempotency', link: '/sdk/advanced/parallel-and-batch/retries' },
                { text: 'Production checklist', link: '/sdk/advanced/parallel-and-batch/checklist' }
              ]
            },
            {
              text: 'Multimodal',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/multimodal' },
                { text: 'Media input', link: '/sdk/advanced/multimodal/inputs' },
                { text: 'Image generation', link: '/sdk/advanced/multimodal/image' },
                { text: 'Audio generation', link: '/sdk/advanced/multimodal/audio' },
                { text: 'Transcription', link: '/sdk/advanced/multimodal/transcription' },
                { text: 'OCR', link: '/sdk/advanced/multimodal/ocr' },
                { text: 'Tool results', link: '/sdk/advanced/multimodal/tool-results' },
                { text: 'Pipelines', link: '/sdk/advanced/multimodal/pipelines' },
                { text: 'Production checklist', link: '/sdk/advanced/multimodal/checklist' }
              ]
            },
            {
              text: 'Sandbox execution',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/advanced/sandbox' },
                { text: 'Create a sandbox', link: '/sdk/advanced/sandbox/create' },
                { text: 'File tools and artifacts', link: '/sdk/advanced/sandbox/files' },
                { text: 'Command execution', link: '/sdk/advanced/sandbox/commands' },
                { text: 'Processes and previews', link: '/sdk/advanced/sandbox/processes' },
                { text: 'Sessions and cleanup', link: '/sdk/advanced/sandbox/sessions' },
                { text: 'Limits and security', link: '/sdk/advanced/sandbox/security' },
                { text: 'Production checklist', link: '/sdk/advanced/sandbox/checklist' }
              ]
            }
          ]
        },
        {
          text: 'Providers',
          items: [
            { text: 'Overview', link: '/sdk/providers' },
            { text: 'Model boundary', link: '/sdk/providers/model-boundary' },
            { text: 'Choose a provider', link: '/sdk/providers/choose-a-provider' },
            { text: 'Capability matrix', link: '/sdk/providers/capability-matrix' },
            {
              text: 'OpenAI',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/providers/openai' },
                { text: 'Setup', link: '/sdk/providers/openai/setup' },
                { text: 'Completions', link: '/sdk/providers/openai/completions' },
                { text: 'Responses and Chat', link: '/sdk/providers/openai/responses-and-chat' },
                { text: 'Embeddings', link: '/sdk/providers/openai/embeddings' },
                { text: 'Media models', link: '/sdk/providers/openai/media' },
                { text: 'Model listing', link: '/sdk/providers/openai/model-listing' },
                { text: 'Production', link: '/sdk/providers/openai/production' }
              ]
            },
            {
              text: 'Anthropic',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/providers/anthropic' },
                { text: 'Setup', link: '/sdk/providers/anthropic/setup' },
                { text: 'Capabilities', link: '/sdk/providers/anthropic/capabilities' },
                { text: 'Model options', link: '/sdk/providers/anthropic/model-options' },
                { text: 'Vertex AI', link: '/sdk/providers/anthropic/vertex-ai' },
                { text: 'Production', link: '/sdk/providers/anthropic/production' }
              ]
            },
            {
              text: 'Gemini',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/providers/gemini' },
                { text: 'Setup', link: '/sdk/providers/gemini/setup' },
                { text: 'Completions', link: '/sdk/providers/gemini/completions' },
                { text: 'Multimodal input', link: '/sdk/providers/gemini/multimodal-input' },
                { text: 'Embeddings', link: '/sdk/providers/gemini/embeddings' },
                { text: 'Image and transcription', link: '/sdk/providers/gemini/media-models' },
                { text: 'Vertex AI', link: '/sdk/providers/gemini/vertex-ai' },
                { text: 'Models and options', link: '/sdk/providers/gemini/model-options' },
                { text: 'Production', link: '/sdk/providers/gemini/production' }
              ]
            },
            {
              text: 'Mistral',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/providers/mistral' },
                { text: 'Setup', link: '/sdk/providers/mistral/setup' },
                { text: 'Completions', link: '/sdk/providers/mistral/completions' },
                { text: 'Tools and schemas', link: '/sdk/providers/mistral/tools-and-schemas' },
                { text: 'Embeddings', link: '/sdk/providers/mistral/embeddings' },
                { text: 'OCR', link: '/sdk/providers/mistral/ocr' },
                { text: 'Model listing', link: '/sdk/providers/mistral/model-listing' },
                { text: 'Production', link: '/sdk/providers/mistral/production' }
              ]
            },
            {
              text: 'Compatible APIs',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/sdk/providers/compatible' },
                { text: 'Endpoint setup', link: '/sdk/providers/compatible/setup' },
                { text: 'Chat or Responses', link: '/sdk/providers/compatible/adapters' },
                { text: 'Verify capabilities', link: '/sdk/providers/compatible/capabilities' },
                { text: 'Models and parameters', link: '/sdk/providers/compatible/models-and-parameters' },
                { text: 'Compatibility testing', link: '/sdk/providers/compatible/testing' },
                { text: 'Production checklist', link: '/sdk/providers/compatible/production' }
              ]
            }
          ]
        }
      ],
      '/studio/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Introduction', link: '/studio/' },
            { text: 'Install and setup', link: '/studio/install-and-setup' },
            { text: 'Run your first agent', link: '/studio/run-your-first-agent' },
            { text: 'How Studio works', link: '/studio/how-studio-works' }
          ]
        },
        {
          text: 'Workspace',
          items: [
            {
              text: 'Playground',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/studio/playground' },
                { text: 'Run an agent', link: '/studio/playground/run-an-agent' },
                { text: 'Models and attachments', link: '/studio/playground/models-and-attachments' },
                { text: 'Approvals and questions', link: '/studio/playground/approvals-and-questions' }
              ]
            },
            {
              text: 'Pipelines',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/studio/pipelines' },
                { text: 'Graph and inputs', link: '/studio/pipelines/graph-and-inputs' },
                { text: 'Runs, logs, and replay', link: '/studio/pipelines/runs-logs-and-replay' }
              ]
            },
            { text: 'Sessions', link: '/studio/sessions' },
            {
              text: 'Traces',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/studio/traces' },
                { text: 'Inspect a trace', link: '/studio/traces/inspect-a-trace' },
                { text: 'Session traces and logs', link: '/studio/traces/session-traces-and-logs' }
              ]
            }
          ]
        },
        {
          text: 'Inspect',
          items: [
            { text: 'Agents', link: '/studio/agents' },
            {
              text: 'Tools',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/studio/tools' },
                { text: 'Inspect schemas', link: '/studio/tools/inspect-schemas' },
                { text: 'Run tools directly', link: '/studio/tools/run-tools-directly' },
                { text: 'Approval behavior', link: '/studio/tools/approval-behavior' }
              ]
            },
            { text: 'MCP', link: '/studio/mcp' },
            {
              text: 'Knowledge',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/studio/knowledge' },
                { text: 'Static context', link: '/studio/knowledge/static-context' },
                { text: 'Dynamic context', link: '/studio/knowledge/dynamic-context' },
                { text: 'Dynamic tools', link: '/studio/knowledge/dynamic-tools' },
                { text: 'Retrieval evidence', link: '/studio/knowledge/retrieval-evidence' }
              ]
            },
            { text: 'Memory', link: '/studio/memory' },
            { text: 'Sandboxes', link: '/studio/sandboxes' },
            { text: 'Runtime status', link: '/studio/runtime-status' }
          ]
        },
        {
          text: 'Configure',
          items: [
            { text: 'Register agents and pipelines', link: '/studio/configure/register-agents-and-pipelines' },
            { text: 'Quick prompts', link: '/studio/configure/quick-prompts' },
            { text: 'Model catalog', link: '/studio/configure/model-catalog' },
            { text: 'Storage and persistence', link: '/studio/configure/storage-and-persistence' },
            { text: 'UI and server options', link: '/studio/configure/ui-and-server-options' },
            { text: 'Lifecycle and cleanup', link: '/studio/configure/lifecycle-and-cleanup' },
            { text: 'Security boundaries', link: '/studio/configure/security-boundaries' }
          ]
        }
      ],
      '/lens/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Introduction', link: '/lens/' },
            { text: 'Install and setup', link: '/lens/install-and-setup' },
            { text: 'Your first trace', link: '/lens/your-first-trace' },
            { text: 'Core concepts', link: '/lens/core-concepts' }
          ]
        },
        {
          text: 'Connect',
          items: [
            {
              text: 'Anvia SDK',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/connect/anvia' },
                { text: 'Configure tracing', link: '/lens/connect/anvia/configure-tracing' },
                { text: 'Trace context', link: '/lens/connect/anvia/trace-context' },
                { text: 'Capture and privacy', link: '/lens/connect/anvia/capture-and-privacy' },
                { text: 'Flush and shutdown', link: '/lens/connect/anvia/flush-and-shutdown' }
              ]
            },
            {
              text: 'Langfuse',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/connect/langfuse' },
                { text: 'Connect instrumentation', link: '/lens/connect/langfuse/connect-existing-instrumentation' },
                { text: 'Compatibility limits', link: '/lens/connect/langfuse/compatibility-limits' }
              ]
            }
          ]
        },
        {
          text: 'Observability',
          items: [
            { text: 'Overview', link: '/lens/observability' },
            {
              text: 'Traces',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/observability/traces' },
                { text: 'Trace explorer', link: '/lens/observability/traces/explorer' },
                { text: 'Trace details', link: '/lens/observability/traces/details' },
                { text: 'Compare traces', link: '/lens/observability/traces/compare' },
                { text: 'Trace reviews', link: '/lens/observability/traces/reviews' }
              ]
            },
            { text: 'Sessions', link: '/lens/observability/sessions' },
            { text: 'Users', link: '/lens/observability/users' },
            { text: 'Costs', link: '/lens/observability/costs' },
            {
              text: 'Alerts',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/observability/alerts' },
                { text: 'Alert rules', link: '/lens/observability/alerts/rules' },
                { text: 'Incidents', link: '/lens/observability/alerts/incidents' }
              ]
            }
          ]
        },
        {
          text: 'Evaluations',
          items: [
            { text: 'Overview', link: '/lens/evaluations' },
            { text: 'What to evaluate', link: '/lens/evaluations/what-to-evaluate' },
            { text: 'Run evaluations', link: '/lens/evaluations/run-evaluations' },
            { text: 'Evaluation runs', link: '/lens/evaluations/runs' },
            { text: 'Results', link: '/lens/evaluations/results' },
            {
              text: 'Datasets',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/evaluations/datasets' },
                { text: 'Observed datasets', link: '/lens/evaluations/datasets/observed' },
                { text: 'Managed datasets', link: '/lens/evaluations/datasets/managed' },
                { text: 'Versions and publishing', link: '/lens/evaluations/datasets/versions' }
              ]
            },
            { text: 'Compare releases', link: '/lens/evaluations/compare' },
            {
              text: 'Quality gates',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/evaluations/quality-gates' },
                { text: 'Configure gates', link: '/lens/evaluations/quality-gates/configure' },
                { text: 'CI enforcement', link: '/lens/evaluations/quality-gates/ci' }
              ]
            }
          ]
        },
        {
          text: 'Workspace',
          items: [
            { text: 'Overview', link: '/lens/workspace' },
            { text: 'Authentication', link: '/lens/workspace/authentication' },
            { text: 'Projects', link: '/lens/workspace/projects' },
            { text: 'Members and roles', link: '/lens/workspace/members-and-roles' },
            {
              text: 'Project settings',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/lens/workspace/project-settings' },
                { text: 'Ingestion keys', link: '/lens/workspace/project-settings/ingestion-keys' },
                { text: 'Retention and deletion', link: '/lens/workspace/project-settings/retention-and-deletion' }
              ]
            }
          ]
        },
        {
          text: 'Self-hosting',
          items: [
            { text: 'Overview', link: '/lens/self-hosting' },
            { text: 'Deployment', link: '/lens/self-hosting/deployment' },
            { text: 'Architecture', link: '/lens/self-hosting/architecture' },
            { text: 'Configuration', link: '/lens/self-hosting/configuration' },
            { text: 'HTTPS and networking', link: '/lens/self-hosting/https-and-networking' },
            { text: 'Upgrades and backups', link: '/lens/self-hosting/upgrades-and-backups' },
            { text: 'Troubleshooting', link: '/lens/self-hosting/troubleshooting' }
          ]
        }
      ],
      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/packages/' },
            { text: 'Package catalog', link: '/packages/catalog' },
            { text: 'Feature matrix', link: '/packages/feature-matrix' },
            { text: 'Compatibility and versioning', link: '/packages/compatibility-and-versioning' },
            { text: 'Changelog', link: '/packages/changelog' }
          ]
        },
        {
          text: 'Core runtime',
          items: [
            {
              text: '@anvia/core',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/core' },
                { text: 'Get started', link: '/packages/core/get-started' },
                { text: 'Capabilities', link: '/packages/core/capabilities' },
                { text: 'Architecture', link: '/packages/core/architecture' },
                { text: 'Configuration', link: '/packages/core/configuration' },
                { text: 'Lifecycle', link: '/packages/core/runtime-lifecycle' },
                { text: 'Patterns', link: '/packages/core/patterns' },
                { text: 'API', link: '/packages/core/api-reference' },
                { text: 'Releases', link: '/packages/core/releases' }
              ]
            },
            {
              text: '@anvia/server',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/server' },
                { text: 'Get started', link: '/packages/server/get-started' },
                { text: 'Capabilities', link: '/packages/server/capabilities' },
                { text: 'Transports', link: '/packages/server/transports' },
                { text: 'Streaming', link: '/packages/server/streaming' },
                { text: 'Deployment', link: '/packages/server/deployment' },
                { text: 'API', link: '/packages/server/api-reference' },
                { text: 'Releases', link: '/packages/server/releases' }
              ]
            },
            {
              text: '@anvia/react',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/react' },
                { text: 'Get started', link: '/packages/react/get-started' },
                { text: 'Capabilities', link: '/packages/react/capabilities' },
                { text: 'State and streaming', link: '/packages/react/state-and-streaming' },
                { text: 'API', link: '/packages/react/api-reference' },
                { text: 'Releases', link: '/packages/react/releases' }
              ]
            },
            {
              text: '@anvia/react-ui',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/react-ui' },
                { text: 'Get started', link: '/packages/react-ui/get-started' },
                { text: 'Capabilities', link: '/packages/react-ui/capabilities' },
                { text: 'Components and theming', link: '/packages/react-ui/components-and-theming' },
                { text: 'API', link: '/packages/react-ui/api-reference' },
                { text: 'Releases', link: '/packages/react-ui/releases' }
              ]
            }
          ]
        },
        {
          text: 'Model providers',
          items: [
            {
              text: '@anvia/openai',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/openai' },
                { text: 'Get started', link: '/packages/openai/get-started' },
                { text: 'Capabilities', link: '/packages/openai/capabilities' },
                { text: 'Configuration', link: '/packages/openai/configuration' },
                { text: 'Compatible endpoints', link: '/packages/openai/compatible-endpoints' },
                { text: 'Models and media', link: '/packages/openai/models-and-media' },
                { text: 'API', link: '/packages/openai/api-reference' },
                { text: 'Releases', link: '/packages/openai/releases' }
              ]
            },
            {
              text: '@anvia/anthropic',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/anthropic' },
                { text: 'Get started', link: '/packages/anthropic/get-started' },
                { text: 'Capabilities', link: '/packages/anthropic/capabilities' },
                { text: 'Configuration', link: '/packages/anthropic/configuration' },
                { text: 'Compatible endpoints', link: '/packages/anthropic/compatible-endpoints' },
                { text: 'Vertex AI', link: '/packages/anthropic/vertex-ai' },
                { text: 'API', link: '/packages/anthropic/api-reference' },
                { text: 'Releases', link: '/packages/anthropic/releases' }
              ]
            },
            {
              text: '@anvia/gemini',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/gemini' },
                { text: 'Get started', link: '/packages/gemini/get-started' },
                { text: 'Capabilities', link: '/packages/gemini/capabilities' },
                { text: 'Configuration', link: '/packages/gemini/configuration' },
                { text: 'Vertex AI', link: '/packages/gemini/vertex-ai' },
                { text: 'Models and media', link: '/packages/gemini/models-and-media' },
                { text: 'API', link: '/packages/gemini/api-reference' },
                { text: 'Releases', link: '/packages/gemini/releases' }
              ]
            },
            {
              text: '@anvia/mistral',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/mistral' },
                { text: 'Get started', link: '/packages/mistral/get-started' },
                { text: 'Capabilities', link: '/packages/mistral/capabilities' },
                { text: 'Configuration', link: '/packages/mistral/configuration' },
                { text: 'OCR', link: '/packages/mistral/ocr' },
                { text: 'Mapping helpers', link: '/packages/mistral/mapping-helpers' },
                { text: 'API', link: '/packages/mistral/api-reference' },
                { text: 'Releases', link: '/packages/mistral/releases' }
              ]
            },
            {
              text: '@anvia/grok',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/grok' },
                { text: 'Get started', link: '/packages/grok/get-started' },
                { text: 'Capabilities', link: '/packages/grok/capabilities' },
                { text: 'Configuration', link: '/packages/grok/configuration' },
                { text: 'Server tools', link: '/packages/grok/server-tools' },
                { text: 'Models and media', link: '/packages/grok/models-and-media' },
                { text: 'API', link: '/packages/grok/api-reference' },
                { text: 'Releases', link: '/packages/grok/releases' }
              ]
            }
          ]
        },
        {
          text: 'Embeddings',
          items: [
            {
              text: '@anvia/fastembed',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/fastembed' },
                { text: 'Get started', link: '/packages/fastembed/get-started' },
                { text: 'Capabilities', link: '/packages/fastembed/capabilities' },
                { text: 'Configuration', link: '/packages/fastembed/configuration' },
                { text: 'Local runtime', link: '/packages/fastembed/local-runtime' },
                { text: 'Sparse embeddings', link: '/packages/fastembed/sparse-embeddings' },
                { text: 'API', link: '/packages/fastembed/api-reference' },
                { text: 'Releases', link: '/packages/fastembed/releases' }
              ]
            },
            {
              text: '@anvia/transformers',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/transformers' },
                { text: 'Get started', link: '/packages/transformers/get-started' },
                { text: 'Capabilities', link: '/packages/transformers/capabilities' },
                { text: 'Configuration', link: '/packages/transformers/configuration' },
                { text: 'Model loading', link: '/packages/transformers/model-loading' },
                { text: 'API', link: '/packages/transformers/api-reference' },
                { text: 'Releases', link: '/packages/transformers/releases' }
              ]
            }
          ]
        },
        {
          text: 'Memory',
          items: [
            {
              text: '@anvia/memory-sqlite',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/memory-sqlite' },
                { text: 'Get started', link: '/packages/memory-sqlite/get-started' },
                { text: 'Capabilities', link: '/packages/memory-sqlite/capabilities' },
                { text: 'Configuration', link: '/packages/memory-sqlite/configuration' },
                { text: 'Schema and migrations', link: '/packages/memory-sqlite/schema-and-migrations' },
                { text: 'Scope and concurrency', link: '/packages/memory-sqlite/scoping-and-concurrency' },
                { text: 'Production', link: '/packages/memory-sqlite/production' },
                { text: 'API', link: '/packages/memory-sqlite/api-reference' },
                { text: 'Releases', link: '/packages/memory-sqlite/releases' }
              ]
            },
            {
              text: '@anvia/memory-postgres',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/memory-postgres' },
                { text: 'Get started', link: '/packages/memory-postgres/get-started' },
                { text: 'Capabilities', link: '/packages/memory-postgres/capabilities' },
                { text: 'Configuration', link: '/packages/memory-postgres/configuration' },
                { text: 'Schema and migrations', link: '/packages/memory-postgres/schema-and-migrations' },
                { text: 'Scope and concurrency', link: '/packages/memory-postgres/scoping-and-concurrency' },
                { text: 'Production', link: '/packages/memory-postgres/production' },
                { text: 'API', link: '/packages/memory-postgres/api-reference' },
                { text: 'Releases', link: '/packages/memory-postgres/releases' }
              ]
            },
            {
              text: '@anvia/memory-drizzle',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/memory-drizzle' },
                { text: 'Get started', link: '/packages/memory-drizzle/get-started' },
                { text: 'Capabilities', link: '/packages/memory-drizzle/capabilities' },
                { text: 'Configuration', link: '/packages/memory-drizzle/configuration' },
                { text: 'Schema and migrations', link: '/packages/memory-drizzle/schema-and-migrations' },
                { text: 'Scope and concurrency', link: '/packages/memory-drizzle/scoping-and-concurrency' },
                { text: 'Production', link: '/packages/memory-drizzle/production' },
                { text: 'API', link: '/packages/memory-drizzle/api-reference' },
                { text: 'Releases', link: '/packages/memory-drizzle/releases' }
              ]
            },
            {
              text: '@anvia/memory-prisma',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/memory-prisma' },
                { text: 'Get started', link: '/packages/memory-prisma/get-started' },
                { text: 'Capabilities', link: '/packages/memory-prisma/capabilities' },
                { text: 'Configuration', link: '/packages/memory-prisma/configuration' },
                { text: 'Schema and migrations', link: '/packages/memory-prisma/schema-and-migrations' },
                { text: 'Scope and concurrency', link: '/packages/memory-prisma/scoping-and-concurrency' },
                { text: 'Production', link: '/packages/memory-prisma/production' },
                { text: 'API', link: '/packages/memory-prisma/api-reference' },
                { text: 'Releases', link: '/packages/memory-prisma/releases' }
              ]
            }
          ]
        },
        {
          text: 'Vector stores',
          items: [
            {
              text: '@anvia/chroma',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/chroma' },
                { text: 'Get started', link: '/packages/chroma/get-started' },
                { text: 'Capabilities', link: '/packages/chroma/capabilities' },
                { text: 'Collections', link: '/packages/chroma/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/chroma/search-and-filters' },
                { text: 'Production', link: '/packages/chroma/production' },
                { text: 'API', link: '/packages/chroma/api-reference' },
                { text: 'Releases', link: '/packages/chroma/releases' }
              ]
            },
            {
              text: '@anvia/lancedb',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/lancedb' },
                { text: 'Get started', link: '/packages/lancedb/get-started' },
                { text: 'Capabilities', link: '/packages/lancedb/capabilities' },
                { text: 'Tables and indexes', link: '/packages/lancedb/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/lancedb/search-and-filters' },
                { text: 'Production', link: '/packages/lancedb/production' },
                { text: 'API', link: '/packages/lancedb/api-reference' },
                { text: 'Releases', link: '/packages/lancedb/releases' }
              ]
            },
            {
              text: '@anvia/milvus',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/milvus' },
                { text: 'Get started', link: '/packages/milvus/get-started' },
                { text: 'Capabilities', link: '/packages/milvus/capabilities' },
                { text: 'Collections', link: '/packages/milvus/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/milvus/search-and-filters' },
                { text: 'Production', link: '/packages/milvus/production' },
                { text: 'API', link: '/packages/milvus/api-reference' },
                { text: 'Releases', link: '/packages/milvus/releases' }
              ]
            },
            {
              text: '@anvia/pgvector',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/pgvector' },
                { text: 'Get started', link: '/packages/pgvector/get-started' },
                { text: 'Capabilities', link: '/packages/pgvector/capabilities' },
                { text: 'Tables and indexes', link: '/packages/pgvector/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/pgvector/search-and-filters' },
                { text: 'Production', link: '/packages/pgvector/production' },
                { text: 'API', link: '/packages/pgvector/api-reference' },
                { text: 'Releases', link: '/packages/pgvector/releases' }
              ]
            },
            {
              text: '@anvia/pinecone',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/pinecone' },
                { text: 'Get started', link: '/packages/pinecone/get-started' },
                { text: 'Capabilities', link: '/packages/pinecone/capabilities' },
                { text: 'Indexes and namespaces', link: '/packages/pinecone/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/pinecone/search-and-filters' },
                { text: 'Production', link: '/packages/pinecone/production' },
                { text: 'API', link: '/packages/pinecone/api-reference' },
                { text: 'Releases', link: '/packages/pinecone/releases' }
              ]
            },
            {
              text: '@anvia/qdrant',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/qdrant' },
                { text: 'Get started', link: '/packages/qdrant/get-started' },
                { text: 'Capabilities', link: '/packages/qdrant/capabilities' },
                { text: 'Collections', link: '/packages/qdrant/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/qdrant/search-and-filters' },
                { text: 'Production', link: '/packages/qdrant/production' },
                { text: 'API', link: '/packages/qdrant/api-reference' },
                { text: 'Releases', link: '/packages/qdrant/releases' }
              ]
            },
            {
              text: '@anvia/redis',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/redis' },
                { text: 'Get started', link: '/packages/redis/get-started' },
                { text: 'Capabilities', link: '/packages/redis/capabilities' },
                { text: 'Keys and indexes', link: '/packages/redis/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/redis/search-and-filters' },
                { text: 'Production', link: '/packages/redis/production' },
                { text: 'API', link: '/packages/redis/api-reference' },
                { text: 'Releases', link: '/packages/redis/releases' }
              ]
            },
            {
              text: '@anvia/weaviate',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/weaviate' },
                { text: 'Get started', link: '/packages/weaviate/get-started' },
                { text: 'Capabilities', link: '/packages/weaviate/capabilities' },
                { text: 'Collections', link: '/packages/weaviate/collections-and-indexing' },
                { text: 'Search and filters', link: '/packages/weaviate/search-and-filters' },
                { text: 'Production', link: '/packages/weaviate/production' },
                { text: 'API', link: '/packages/weaviate/api-reference' },
                { text: 'Releases', link: '/packages/weaviate/releases' }
              ]
            }
          ]
        },
        {
          text: 'Observability',
          items: [
            {
              text: '@anvia/logger',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/logger' },
                { text: 'Get started', link: '/packages/logger/get-started' },
                { text: 'Capabilities', link: '/packages/logger/capabilities' },
                { text: 'Data and privacy', link: '/packages/logger/data-and-privacy' },
                { text: 'Production', link: '/packages/logger/production' },
                { text: 'API', link: '/packages/logger/api-reference' },
                { text: 'Releases', link: '/packages/logger/releases' }
              ]
            },
            {
              text: '@anvia/otel',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/otel' },
                { text: 'Get started', link: '/packages/otel/get-started' },
                { text: 'Tracing', link: '/packages/otel/tracing' },
                { text: 'Eval reporting', link: '/packages/otel/eval-reporting' },
                { text: 'Data and privacy', link: '/packages/otel/data-and-privacy' },
                { text: 'Lifecycle', link: '/packages/otel/lifecycle' },
                { text: 'API', link: '/packages/otel/api-reference' },
                { text: 'Releases', link: '/packages/otel/releases' }
              ]
            },
            {
              text: '@anvia/lens',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/lens' },
                { text: 'Get started', link: '/packages/lens/get-started' },
                { text: 'Tracing', link: '/packages/lens/tracing' },
                { text: 'Evals and datasets', link: '/packages/lens/evals-and-datasets' },
                { text: 'Data and privacy', link: '/packages/lens/data-and-privacy' },
                { text: 'Lifecycle', link: '/packages/lens/lifecycle' },
                { text: 'API', link: '/packages/lens/api-reference' },
                { text: 'Releases', link: '/packages/lens/releases' }
              ]
            },
            {
              text: '@anvia/langfuse',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/langfuse' },
                { text: 'Get started', link: '/packages/langfuse/get-started' },
                { text: 'Tracing', link: '/packages/langfuse/tracing' },
                { text: 'Prompts and data', link: '/packages/langfuse/prompts-and-data' },
                { text: 'Evals and scores', link: '/packages/langfuse/evals-and-scores' },
                { text: 'Data and privacy', link: '/packages/langfuse/data-and-privacy' },
                { text: 'Lifecycle', link: '/packages/langfuse/lifecycle' },
                { text: 'API', link: '/packages/langfuse/api-reference' },
                { text: 'Releases', link: '/packages/langfuse/releases' }
              ]
            }
          ]
        },
        {
          text: 'Development tools',
          items: [
            {
              text: '@anvia/studio',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/studio' },
                { text: 'Get started', link: '/packages/studio/get-started' },
                { text: 'Capabilities', link: '/packages/studio/capabilities' },
                { text: 'Configuration', link: '/packages/studio/configuration' },
                { text: 'Runtime boundary', link: '/packages/studio/runtime-boundary' },
                { text: 'API', link: '/packages/studio/api-reference' },
                { text: 'Releases', link: '/packages/studio/releases' }
              ]
            },
            {
              text: '@anvia/sandbox',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/packages/sandbox' },
                { text: 'Get started', link: '/packages/sandbox/get-started' },
                { text: 'Capabilities', link: '/packages/sandbox/capabilities' },
                { text: 'Lifecycle', link: '/packages/sandbox/lifecycle' },
                { text: 'Security', link: '/packages/sandbox/security' },
                { text: 'API', link: '/packages/sandbox/api-reference' },
                { text: 'Releases', link: '/packages/sandbox/releases' }
              ]
            }
          ]
        }
      ],
      '/faqs/': [
        {
          text: 'FAQs',
          items: [{ text: 'Overview', link: '/faqs/' }]
        },
        {
          text: 'Understanding Anvia',
          items: [
            { text: 'What is Anvia?', link: '/faqs/understanding/what-is-anvia' },
            { text: 'What you can build', link: '/faqs/understanding/what-can-i-build' },
            { text: 'Architecture', link: '/faqs/understanding/how-anvia-is-structured' },
            { text: 'Application ownership', link: '/faqs/understanding/application-ownership' },
            { text: 'What is Anvia not?', link: '/faqs/understanding/what-anvia-is-not' },
            { text: 'When not to use it', link: '/faqs/understanding/when-not-to-use-anvia' }
          ]
        },
        {
          text: 'Choosing Anvia',
          items: [
            { text: 'Why Anvia?', link: '/faqs/choosing/why-anvia' },
            { text: 'Capabilities', link: '/faqs/choosing/capability-overview' },
            { text: 'Other SDKs', link: '/faqs/choosing/using-with-other-sdks' },
            { text: 'Portability', link: '/faqs/choosing/provider-and-platform-independence' }
          ]
        },
        {
          text: 'Comparisons',
          items: [
            { text: 'Stack guide', link: '/faqs/comparisons/' },
            { text: 'Vercel AI SDK', link: '/faqs/comparisons/vercel-ai-sdk' },
            { text: 'Mastra', link: '/faqs/comparisons/mastra' },
            { text: 'VoltAgent', link: '/faqs/comparisons/voltagent' },
            { text: 'Flue', link: '/faqs/comparisons/flue' },
            { text: 'Provider SDKs', link: '/faqs/comparisons/direct-provider-sdks' }
          ]
        },
        {
          text: 'Capabilities',
          items: [
            { text: 'Models', link: '/faqs/capabilities/models-and-providers' },
            { text: 'Completions or agents', link: '/faqs/capabilities/completions-or-agents' },
            { text: 'Tools and MCP', link: '/faqs/capabilities/tools-mcp-and-approvals' },
            { text: 'Memory or knowledge', link: '/faqs/capabilities/memory-or-knowledge' },
            { text: 'Pipelines or agents', link: '/faqs/capabilities/pipelines-or-agents' },
            { text: 'Multi-agent', link: '/faqs/capabilities/multi-agent-systems' },
            { text: 'Structured output', link: '/faqs/capabilities/structured-output' },
            { text: 'Streaming and UI', link: '/faqs/capabilities/streaming-and-ui' },
            { text: 'Sandboxes', link: '/faqs/capabilities/sandbox-execution' }
          ]
        },
        {
          text: 'Studio and Lens',
          items: [
            { text: 'Studio', link: '/faqs/studio-and-lens/what-is-studio' },
            { text: 'Studio in production?', link: '/faqs/studio-and-lens/is-studio-for-production' },
            { text: 'Lens', link: '/faqs/studio-and-lens/what-is-lens' },
            { text: 'Lens or Langfuse?', link: '/faqs/studio-and-lens/lens-or-langfuse' },
            { text: 'Other applications', link: '/faqs/studio-and-lens/can-lens-observe-non-anvia-apps' },
            { text: 'Are they required?', link: '/faqs/studio-and-lens/do-i-need-studio-or-lens' }
          ]
        },
        {
          text: 'Production',
          items: [
            { text: 'Production readiness', link: '/faqs/production/is-anvia-production-ready' },
            { text: 'Auth and permissions', link: '/faqs/production/authentication-and-authorization' },
            { text: 'API keys', link: '/faqs/production/api-keys' },
            { text: 'Deployment', link: '/faqs/production/deploying-anvia' },
            { text: 'Bun support', link: '/faqs/production/bun-support' },
            { text: 'Durable workflows', link: '/faqs/production/durable-workflows' },
            { text: 'Persistence', link: '/faqs/production/persistence' },
            { text: 'Retries and cancellation', link: '/faqs/production/retries-and-cancellation' },
            { text: 'Vendor lock-in', link: '/faqs/production/vendor-lock-in' },
            { text: 'Testing', link: '/faqs/production/testing-agent-behavior' }
          ]
        }
      ],
      '/': [
        {
          text: 'Welcome',
          items: [{ text: 'Welcome to Anvia', link: '/' }]
        },
        {
          text: 'Get Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quickstart', link: '/guide/getting-started' },
            { text: 'Core concepts', link: '/guide/core-concepts' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Products',
          items: [
            { text: 'Anvia SDK', link: '/sdk/' },
            { text: 'Anvia Studio', link: '/studio/' },
            { text: 'Lens Observability', link: '/lens/' }
          ]
        },
        {
          text: 'Use Cases',
          items: [
            { text: 'Build applications', link: '/use-cases/build-applications' },
            { text: 'Observe systems', link: '/use-cases/observe-systems' },
            { text: 'Production operations', link: '/use-cases/production' }
          ]
        }
      ]
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/anvia-hq/anvia' }],
    footer: {
      message: 'Built for Anvia.'
    }
  }
})
