const palette = {
  background: '#101010',
  foreground: '#b7c0ca',
  comment: '#56606a',
  keyword: '#e6a15c',
  type: '#62c3b5',
  function: '#78aee8',
  string: '#9fbd73',
  number: '#bd93d8',
  literal: '#df7d68',
} as const

export const landingCodeTheme = {
  name: 'anvia-landing-code',
  type: 'dark' as const,
  fg: palette.foreground,
  bg: palette.background,
  colors: {
    'editor.background': palette.background,
    'editor.foreground': palette.foreground,
  },
  settings: [
    {
      settings: {
        background: palette.background,
        foreground: palette.foreground,
      },
    },
    {
      scope: [
        'comment',
        'punctuation.definition.comment',
        'string.comment',
      ],
      settings: {
        foreground: palette.comment,
        fontStyle: 'italic',
      },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'string.regexp',
        'punctuation.definition.string',
        'markup.inline.raw.string',
      ],
      settings: { foreground: palette.string },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'storage.type',
        'storage.modifier',
        'variable.language',
        'punctuation.definition.keyword',
      ],
      settings: { foreground: palette.keyword },
    },
    {
      scope: [
        'keyword.operator.assignment',
        'keyword.operator.arithmetic',
        'keyword.operator.bitwise',
        'keyword.operator.comparison',
        'keyword.operator.logical',
        'keyword.operator.relational',
        'keyword.operator.ternary',
        'keyword.operator.optional',
      ],
      settings: { foreground: palette.foreground },
    },
    {
      scope: [
        'keyword.operator.new',
        'keyword.operator.expression.in',
        'keyword.operator.expression.instanceof',
        'keyword.operator.expression.typeof',
      ],
      settings: { foreground: palette.keyword },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'support.type',
        'support.class',
        'support.other.namespace',
        'meta.type.annotation',
        'meta.return.type',
        'entity.name.tag',
        'meta.import variable.other.readwrite.alias',
        'new.expr entity.name.function',
      ],
      settings: { foreground: palette.type },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'variable.function',
        'meta.function-call',
        'meta.method-call',
        'entity.name.operator.custom-literal',
      ],
      settings: { foreground: palette.function },
    },
    {
      scope: [
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
      ],
      settings: { foreground: palette.number },
    },
    {
      scope: [
        'constant.language',
        'constant.character',
        'constant.other',
        'support.constant',
        'variable.other.constant.property',
      ],
      settings: { foreground: palette.literal },
    },
  ],
}
