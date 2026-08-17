type DocsChannel = 'current' | 'rc'

type DocsVersionConfig = {
  channel: DocsChannel
  currentUrl: string
  releaseCandidateUrl: string
}

declare const __DOCS_VERSION_CONFIG__: Readonly<DocsVersionConfig>
