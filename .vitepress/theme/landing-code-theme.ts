type Palette = Record<
  'background' | 'foreground' | 'comment' | 'keyword' | 'type' | 'function' | 'string' | 'number' | 'literal' | 'property',
  string
>

const darkPalette: Palette = {
  background: '#111111',
  foreground: '#c9c9cf',
  comment: '#6b6b74',
  keyword: '#7f86f0',
  type: '#ececf1',
  function: '#4ea6f5',
  string: '#2fd39f',
  number: '#f2638f',
  literal: '#7f86f0',
  property: '#f2638f',
}

const lightPalette: Palette = {
  background: '#fbfcfa',
  foreground: '#3a3f45',
  comment: '#7a7f88',
  keyword: '#4f55c9',
  type: '#1d1d22',
  function: '#1f6fbf',
  string: '#0b7a5a',
  number: '#c8305f',
  literal: '#4f55c9',
  property: '#c8305f',
}

const createCodeTheme = (name: string, type: 'light' | 'dark', palette: Palette) => ({
  name,
  type,
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
    {
      scope: [
        'meta.object-literal.key',
        'support.type.property-name',
        'variable.object.property',
        'variable.other.property.ts',
      ],
      settings: { foreground: palette.property },
    },
    {
      scope: ['punctuation.separator.key-value'],
      settings: { foreground: palette.foreground },
    },
    {
      scope: ['meta.object-literal.key entity.name.function'],
      settings: { foreground: palette.function },
    },
  ],
})

export const landingCodeTheme = createCodeTheme('anvia-landing-code', 'dark', darkPalette)
export const landingCodeLightTheme = createCodeTheme('anvia-landing-code-light', 'light', lightPalette)
