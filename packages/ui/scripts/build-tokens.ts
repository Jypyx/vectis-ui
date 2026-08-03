/**
 * Génère depuis la source typée (`src/tokens/`) :
 *   - `src/styles/tokens.css` : custom properties dans `@layer vectis.tokens`
 *     (`:root` = primitifs + sémantiques light, `[data-theme]` = thèmes)
 *   - `src/tokens/tokens.json` : export JSON brut (outillage externe)
 *
 * Exécution : `pnpm tokens` (lancé automatiquement en pre(build|storybook)).
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

// Un thème ne peut que surcharger des tokens sémantiques existants.
const semanticNames = new Set(semantic.map((f) => f.cssName))
for (const f of dark) {
  if (!semanticNames.has(f.cssName)) {
    throw new Error(`Le thème dark surcharge un token sémantique inconnu : ${f.cssName}`)
  }
}

const INDENT = '    '
const css = `/*
 * FICHIER GÉNÉRÉ — ne pas éditer à la main.
 * Source : src/tokens/  ·  Régénérer : pnpm tokens
 */
@layer vectis.tokens {
  :root {
    color-scheme: light;
${toCssDeclarations(primitives, known, INDENT)}
${toCssDeclarations(semantic, known, INDENT)}
  }

  /* Réapplication explicite du light : permet un sous-arbre light dans un arbre dark. */
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
  `tokens: ${primitives.length} primitifs, ${semantic.length} sémantiques, ${dark.length} surcharges dark → src/styles/tokens.css, src/tokens/tokens.json`,
)
