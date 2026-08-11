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
      { text: 'Lens', link: '/lens/' },
      { text: 'References', link: '/references/' },
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
      '/references/': [{ text: 'References', items: [{ text: 'Overview', link: '/references/' }] }],
      '/faqs/': [{ text: 'FAQs', items: [{ text: 'Overview', link: '/faqs/' }] }],
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
