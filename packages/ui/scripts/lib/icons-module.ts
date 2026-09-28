/**
 * Render one module per icon independently of downloads so the committed registry can be
 * regenerated offline from supplied data.
 */

/** An icon as the generator holds it: its name, then `[outline, filled?]`. */
export type IconEntry = readonly [name: string, paths: readonly string[]]

const quote = (value: string) => `'${value}'`

const header = (revision: string) => `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm icons  ·  Source: scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ ${revision}
 * Apache-2.0 licence © Google.
 */`

/* The words a module cannot export a `const` under. Only the lowercase ones can match
   a Material icon name, which is all this table needs to hold. */
const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

/**
 * The generated tree, keyed by its path under `src/components/VIcon/icons/`. The
 * caller writes it; nothing here touches the filesystem.
 */
export function renderIconsModules(
  revision: string,
  viewBox: string,
  entries: readonly IconEntry[],
): Record<string, string> {
  const files: Record<string, string> = {}
  const names = entries.map(([name]) => name)
  /* Each name becomes an exported binding, so a Material name that is not a valid
     identifier (`3d_rotation`) or is a reserved word (`delete`) would write a module that
     does not parse. Refused here, with the name, rather than at the next typecheck. */
  for (const name of names) {
    if (!/^[a-z_][a-z0-9_]*$/.test(name) || RESERVED_WORDS.has(name)) {
      throw new Error(`[icons] "${name}" cannot be an exported binding: rename it or alias it.`)
    }
  }

  files['viewBox.ts'] = `${header(revision)}

/**
 * Google's export grid, shared by every icon in the registry rather than repeated on
 * each of them. It is VIcon that puts it on the \`<svg>\`, so an icon module carries
 * its paths and nothing else.
 */
export const ICON_VIEW_BOX = '${viewBox}'
`

  files['names.ts'] = `${header(revision)}

const NAMES = [
${names.map((name) => `  ${quote(name)},`).join('\n')}
] as const

/** The icon names the DS renders itself: the contract of a consumer resolver. */
export type IconName = (typeof NAMES)[number]

/**
 * The names alone, carrying no drawing at all. \`classIconResolver\` in \`strict\` mode
 * asks nothing more than "does the design system ship this name?", and a module of
 * its own is what stops a consumer who wired in their OWN icon library from
 * downloading ${entries.length} Material paths to answer that one question.
 */
export const builtinIconNames: ReadonlySet<string> = /* @__PURE__ */ new Set(NAMES)
`

  for (const [name, paths] of entries) {
    files[`${name}.ts`] = `${header(revision)}
import type { BuiltinIcon } from '../types'

/** Material Symbols Rounded \`${name}\`${paths.length === 2 ? ', outline then filled' : ''}. */
export const ${name} = {
  name: '${name}',
  paths: [
${paths.map((d) => `    ${quote(d)},`).join('\n')}
  ],
} as const satisfies BuiltinIcon
`
  }

  files['index.ts'] = `${header(revision)}
${names.map((name) => `import { ${name} } from './${name}'`).join('\n')}

export { ICON_VIEW_BOX } from './viewBox'
export { builtinIconNames, type IconName } from './names'
export {
${names.map((name) => `  ${name},`).join('\n')}
}

/**
 * Every icon at once, for the places that legitimately want the whole set: the
 * gallery in the stories, the documentation site, the tests.
 *
 * NOTHING the library ships imports this barrel: a component imports the two or
 * three icon modules it draws, by name. Importing it from a component would pull all
 * ${entries.length} drawings back into every consumer's bundle and undo the split.
 */
export const builtinIcons = {
${names.map((name) => `  ${name},`).join('\n')}
} as const
`

  return files
}
