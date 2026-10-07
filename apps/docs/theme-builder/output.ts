/**
 * Turns a configuration into what the reader copies: a stylesheet of token overrides and the
 * icon resolver for Vue or Nuxt. The preview applies the same declarations, all of them rather
 * than the overrides alone, since the site's own stylesheet already sets some of these tokens.
 */
import { formatOklch, sameColor } from './color'
import { BUILTIN_ICON_NAMES } from './iconAliases'
import {
  BODY_FONTS,
  CODE_FONTS,
  HEADING_FONTS,
  RADIUS_PRESETS,
  fontById,
  googleFontsUrl,
  iconLibraryById,
  materialFontUrl,
  type IconLibrary,
} from './options'
import {
  COLOR_GROUPS,
  DEFAULT_COLORS,
  GROUP_ROLES,
  cssNameOf,
  resolveColors,
  resolveRadius,
  type ThemeConfig,
} from './model'

export interface ThemeDeclarations {
  /** Stylesheets to load first: Google Fonts, an icon font. */
  imports: string[]
  /** The root font size as a percentage, when it changes. */
  rootFontSize?: string
  /** Declarations for `:root, [data-theme='light']`. */
  light: [string, string][]
  /** Declarations for `[data-theme='dark']`. */
  dark: [string, string][]
}

const rem = (px: number) => (px === 0 ? '0px' : `${px / 16}rem`)

/** Every token the configuration sets; with `full`, the unchanged ones too. */
export function themeDeclarations(config: ThemeConfig, full = false): ThemeDeclarations {
  const light: [string, string][] = []
  const dark: [string, string][] = []

  const lightColors = resolveColors(config, 'light')
  const darkColors = resolveColors(config, 'dark')
  for (const role of COLOR_GROUPS.flatMap((group) => GROUP_ROLES[group])) {
    const lightChanged = full || !sameColor(lightColors[role]!, DEFAULT_COLORS.light[role]!)
    // The light block's `:root` also matches a dark root, and unlayered, it beats the library's
    // dark block: a role overridden there must be restated for dark even when it is unchanged.
    const darkChanged = lightChanged || !sameColor(darkColors[role]!, DEFAULT_COLORS.dark[role]!)
    if (lightChanged) light.push([cssNameOf(role), formatOklch(lightColors[role]!)])
    if (darkChanged) dark.push([cssNameOf(role), formatOklch(darkColors[role]!)])
  }

  const heading = fontById(HEADING_FONTS, config.fonts.heading)
  const body = fontById(BODY_FONTS, config.fonts.body)
  const code = fontById(CODE_FONTS, config.fonts.code)
  if (full || heading.google) light.push(['--vectis-text-family-heading', heading.stack])
  if (full || body.google) light.push(['--vectis-text-family', body.stack])
  if (full || code.google) light.push(['--vectis-text-family-code', code.stack])

  const library = iconLibraryById(config.icons)
  const imports = [googleFontsUrl([heading, body, code])].filter((url) => url !== undefined)
  if (library.kind === 'ligature') {
    imports.push(materialFontUrl(library.fontFamily))
    light.push(['--vectis-font-family-icon', `'${library.fontFamily}'`])
  }

  const radius = resolveRadius(config)
  const initial = RADIUS_PRESETS.medium
  for (const role of ['interactive', 'surface', 'overlay'] as const)
    if (full || radius[role] !== initial[role])
      light.push([`--vectis-radius-${role}`, rem(radius[role])])
  // The chip radius aliases the control radius, so it needs stating only when they differ.
  if (full || radius.chip !== radius.interactive)
    light.push(['--vectis-radius-chip', rem(radius.chip)])

  const rootFontSize =
    full || config.baseSize !== 16 ? `${(config.baseSize / 16) * 100}%` : undefined

  return { imports, rootFontSize, light, dark }
}

const block = (selector: string, declarations: [string, string][]) =>
  `${selector} {\n${declarations.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`

/** The declarations as a stylesheet, `@import` rules included or left out. */
export function themeCss(declarations: ThemeDeclarations, withImports = true): string {
  const parts = [
    ...(withImports ? declarations.imports.map((url) => `@import url('${url}');`) : []),
    declarations.rootFontSize && block('html', [['font-size', declarations.rootFontSize]]),
    declarations.light.length > 0 && block(":root,\n[data-theme='light']", declarations.light),
    declarations.dark.length > 0 && block("[data-theme='dark']", declarations.dark),
  ].filter(Boolean)
  return parts.join('\n\n')
}

/** The stylesheet the reader copies, or a note when it would be empty. */
export function generatedCss(config: ThemeConfig, notes: { header: string; empty: string }) {
  const css = themeCss(themeDeclarations(config))
  return css ? `/* ${notes.header} */\n${css}\n` : `/* ${notes.empty} */\n`
}

const indent = (text: string, by: string) =>
  text
    .split('\n')
    .map((line) => (line ? by + line : line))
    .join('\n')

/** The aliases of the built-in names, one per line. */
function aliasLines(aliases: Record<string, string>, quote: boolean): string {
  return BUILTIN_ICON_NAMES.map(
    (name) => `${name}: ${quote ? `'${aliases[name]}'` : aliases[name]},`,
  ).join('\n')
}

interface ResolverCode {
  /** Import lines, the library's helpers first. */
  imports: string[]
  /** CSS files to import, as module specifiers. */
  styles: string[]
  /** The `setIconResolver(...)` call, or nothing for the built-in icons. */
  call?: string
}

function resolverCode(library: IconLibrary): ResolverCode {
  switch (library.kind) {
    case 'builtin':
      return { imports: [], styles: [] }
    case 'ligature':
      return {
        imports: ["import { ligatureIconResolver, setIconResolver } from 'vectis-ui'"],
        styles: [],
        call: 'setIconResolver(ligatureIconResolver())',
      }
    case 'class':
      return {
        imports: ["import { classIconResolver, setIconResolver } from 'vectis-ui'"],
        styles: library.imports,
        call: [
          'setIconResolver(',
          '  classIconResolver({',
          '    aliases: {',
          indent(aliasLines(library.aliases, true), '      '),
          '    },',
          `    className: ${library.classNameSource},`,
          '  }),',
          ')',
        ].join('\n'),
      }
    case 'component': {
      const names = [...new Set(BUILTIN_ICON_NAMES.map((name) => library.aliases[name]!))].sort()
      return {
        imports: [
          "import { componentIconResolver, setIconResolver } from 'vectis-ui'",
          `import {\n${indent(names.join(',\n'), '  ')},\n} from '${library.from}'`,
        ],
        styles: [],
        call: [
          'setIconResolver(',
          '  componentIconResolver({',
          '    components: {',
          indent(aliasLines(library.aliases, false), '      '),
          '    },',
          ...(library.filledPropsSource
            ? [`    props: (_name, filled) => (filled ? ${library.filledPropsSource} : {}),`]
            : []),
          '  }),',
          ')',
        ].join('\n'),
      }
    }
  }
}

export interface SnippetNotes {
  /** A line naming the install command, given the command. */
  install: (command: string) => string
  /** A comment saying no resolver is needed. */
  builtin: string
  /** A comment explaining why the Nuxt plugin is universal. */
  universal: string
}

/** `main.ts` for a Vue application. */
export function vueSnippet(
  config: ThemeConfig,
  installCommand: (pkg: string) => string,
  notes: SnippetNotes,
): string {
  const library = iconLibraryById(config.icons)
  const code = resolverCode(library)
  const lines = [
    ...(library.package ? [`// ${notes.install(installCommand(library.package))}`, ''] : []),
    '// main.ts',
    "import { createApp } from 'vue'",
    ...code.imports,
    '',
    "import 'vectis-ui/styles.css'",
    ...code.styles.map((style) => `import '${style}'`),
    "import './theme.css'",
    '',
    "import App from './App.vue'",
    '',
    code.call ?? `// ${notes.builtin}`,
    '',
    "createApp(App).mount('#app')",
  ]
  return `${lines.join('\n')}\n`
}

/** `nuxt.config.ts` and a universal plugin for a Nuxt application. */
export function nuxtSnippet(
  config: ThemeConfig,
  installCommand: (pkg: string) => string,
  notes: SnippetNotes,
): string {
  const library = iconLibraryById(config.icons)
  const code = resolverCode(library)
  const css = ['vectis-ui/styles.css', '~/assets/css/theme.css', ...code.styles]
  const lines = [
    ...(library.package ? [`// ${notes.install(installCommand(library.package))}`, ''] : []),
    '// nuxt.config.ts',
    'export default defineNuxtConfig({',
    `  css: [${css.map((file) => `'${file}'`).join(', ')}],`,
    '})',
  ]
  if (code.call)
    lines.push(
      '',
      '// plugins/icons.ts',
      ...code.imports,
      '',
      `// ${notes.universal}`,
      code.call,
      '',
      'export default defineNuxtPlugin(() => {})',
    )
  else lines.push('', `// ${notes.builtin}`)
  return `${lines.join('\n')}\n`
}
