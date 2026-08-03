/**
 * Generates, from the typed source (`src/tokens/`):
 *   - `src/styles/tokens.css`: custom properties inside `@layer vectis.tokens`
 *     (`:root` = primitives + light semantics, `[data-theme]` = themes)
 *   - `src/tokens/tokens.json`: raw JSON export (external tooling)
 *
 * Run with `pnpm tokens` (executed automatically in pre(build|storybook)).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { flattenTokens, toCssDeclarations, tokens } from '../src/tokens'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const primitives = flattenTokens(tokens.primitives)
const semantic = flattenTokens(tokens.semantic)
const dark = flattenTokens(tokens.themes.dark)

const known: ReadonlySet<string> = new Set([...primitives, ...semantic].map((f) => f.cssName))

// A theme may only override existing semantic tokens.
const semanticNames = new Set(semantic.map((f) => f.cssName))
for (const f of dark) {
  if (!semanticNames.has(f.cssName)) {
    throw new Error(`The dark theme overrides an unknown semantic token: ${f.cssName}`)
  }
}

const INDENT = '    '
const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Source: src/tokens/  ·  Regenerate: pnpm tokens
 */
@layer vectis.tokens {
  :root {
    color-scheme: light;
${toCssDeclarations(primitives, known, INDENT)}
${toCssDeclarations(semantic, known, INDENT)}
  }

  /* Explicit re-application of light: allows a light subtree inside a dark tree. */
  [data-theme='light'] {
    color-scheme: light;
${toCssDeclarations(semantic, known, INDENT)}
  }

  [data-theme='dark'] {
    color-scheme: dark;
${toCssDeclarations(dark, known, INDENT)}
  }
}
`

writeFileSync(resolve(pkgRoot, 'src/styles/tokens.css'), css, 'utf8')

mkdirSync(resolve(pkgRoot, 'src/tokens'), { recursive: true })
writeFileSync(
  resolve(pkgRoot, 'src/tokens/tokens.json'),
  JSON.stringify(tokens, null, 2) + '\n',
  'utf8',
)

console.log(
  `tokens: ${primitives.length} primitives, ${semantic.length} semantics, ${dark.length} dark overrides → src/styles/tokens.css, src/tokens/tokens.json`,
)
