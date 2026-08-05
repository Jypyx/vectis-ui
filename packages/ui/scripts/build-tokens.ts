/**
 * Generates, from the typed source (`src/tokens/`):
 *   - `src/styles/tokens.css`: custom properties inside `@layer vectis.tokens`
 *     (`:root` = primitives + light semantics, `[data-theme]` = themes)
 *   - `src/tokens/tokens.json`: raw JSON export (external tooling)
 *
 * Run with `pnpm tokens` (executed automatically in pre(build|storybook)).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
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

const outputs: [path: string, content: string][] = [
  [resolve(pkgRoot, 'src/styles/tokens.css'), css],
  [resolve(pkgRoot, 'src/tokens/tokens.json'), JSON.stringify(tokens, null, 2) + '\n'],
]

/*
 * `--check` verifies the committed artefacts match the TS source instead of rewriting
 * them. Both are git-tracked AND regenerated in `prebuild`, so drift is invisible to
 * `pnpm test` and `pnpm typecheck`: nothing else would ever notice a hand-edited
 * `tokens.css`. Non-zero exit, naming the file, so CI reads as a fixable instruction.
 */
if (process.argv.includes('--check')) {
  const stale = outputs.filter(
    ([path, content]) => !existsSync(path) || readFileSync(path, 'utf8') !== content,
  )
  if (stale.length) {
    console.error('tokens: the generated files are out of date with src/tokens/*.ts:')
    for (const [path] of stale) console.error(`  - ${relative(pkgRoot, path)}`)
    console.error('Run `pnpm tokens` and commit the result.')
    process.exit(1)
  }
  console.log(`tokens: generated files up to date (${outputs.length} artefacts).`)
} else {
  mkdirSync(resolve(pkgRoot, 'src/tokens'), { recursive: true })
  for (const [path, content] of outputs) writeFileSync(path, content, 'utf8')

  console.log(
    `tokens: ${primitives.length} primitives, ${semantic.length} semantics, ${dark.length} dark overrides → src/styles/tokens.css, src/tokens/tokens.json`,
  )
}
