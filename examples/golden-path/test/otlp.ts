/**
 * Minimal reader for an OTLP/HTTP JSON trace export. The Anvia Lens exporter
 * posts this shape to `/api/public/otel/v1/traces`; parsing it here keeps the
 * smoke test on the same payload Lens receives without running Lens.
 */
export type OtlpAttribute = Readonly<{ key: string; value: Readonly<Record<string, unknown>> }>

export type OtlpSpan = Readonly<{
  name: string
  spanId: string
  parentSpanId?: string
  kind: number
  attributes: readonly OtlpAttribute[]
}>

export type OtlpTraceExport = Readonly<{
  resourceAttributes: readonly OtlpAttribute[]
  spans: readonly OtlpSpan[]
}>

type JsonValue = {
  resourceSpans?: readonly {
    resource?: { attributes?: readonly OtlpAttribute[] }
    scopeSpans?: readonly { spans?: readonly OtlpSpan[] }[]
  }[]
}

export function parseTraceExport(body: Buffer | string): OtlpTraceExport {
  const parsed = JSON.parse(typeof body === 'string' ? body : body.toString('utf8')) as JsonValue
  const resourceSpans = parsed.resourceSpans ?? []

  return {
    resourceAttributes: resourceSpans.flatMap((entry) => entry.resource?.attributes ?? []),
    spans: resourceSpans.flatMap((entry) => (entry.scopeSpans ?? []).flatMap((scope) => scope.spans ?? [])),
  }
}

export function attributeText(span: OtlpSpan, key: string): string | undefined {
  const attribute = span.attributes.find((candidate) => candidate.key === key)
  const value = attribute?.value.stringValue
  return typeof value === 'string' ? value : undefined
}

export function attributeNumber(span: OtlpSpan, key: string): number | undefined {
  const attribute = span.attributes.find((candidate) => candidate.key === key)
  const value = attribute?.value.intValue ?? attribute?.value.doubleValue
  return value === undefined ? undefined : Number(value)
}

export function hasAttribute(span: OtlpSpan, key: string): boolean {
  return span.attributes.some((attribute) => attribute.key === key)
}
