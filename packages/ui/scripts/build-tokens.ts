/**
 * Generate layered tokens.css and DTCG tokens.json from the typed token sources. prebuild and
 * prestorybook run this generator.
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
${toCssDeclarations(primitives, known, INDENT)}
  }

  /*
   * The light semantics are emitted ONCE for both selectors. Naming them together is
   * what lets a light subtree sit inside a dark tree: the second selector re-applies
   * on any element carrying the attribute, and the values inherit from there.
   *
   * Splitting this back into a copy inside \`:root\` and a copy here would restore forty
   * duplicated declarations in the sheet every consumer downloads. The two selectors
   * are the same specificity (0,1,0) as \`[data-theme='dark']\` below, so what decides a
   * dark root — an element matching \`:root\` AND \`[data-theme='dark']\` at once — is the
   * ORDER of these blocks, and nothing else. Never move the dark block above this one.
   */
  :root,
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
 * `--check` verifies the committed artefacts match the TS source instead of rewriting them.
 * Both are git-tracked and regenerated in `prebuild`, so drift is invisible to `pnpm test` and
 * `pnpm typecheck`: nothing else would ever notice a hand-edited `tokens.css`.
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
