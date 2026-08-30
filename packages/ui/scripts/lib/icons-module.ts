/**
 * Renders `src/components/VIcon/icons/` from the paths `build-icons.ts` fetched.
 *
 * It lives apart from the script that feeds it so the generated tree can be produced
 * without touching the network — the regeneration and the download are two different
 * concerns, and only one of them needs GitHub to be reachable.
 *
 * ONE FILE PER ICON, and that is the whole point of the layout. A single table
 * indexed by a string at runtime has no key a bundler can prove reachable, so every
 * consumer used to ship all 34 drawings as soon as anything rendered a VIcon at all —
 * 3.5 kB gzip, more than half the weight of a lone button. Separate modules make the
 * cost proportional by construction, with no dependence on a bundler's willingness to
 * drop an unused binding from a module it is keeping anyway. It is also what keeps
 * `scripts/bench-size.ts` honest: that gate follows IMPORTS, so a shared file would
 * have it report the whole registry against every component that touched one icon.
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

/** The icon names the DS renders itself — the contract of a consumer resolver. */
export type VectisIconName = (typeof NAMES)[number]

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
export { builtinIconNames, type VectisIconName } from './names'
export {
${names.map((name) => `  ${name},`).join('\n')}
}

/**
 * Every icon at once, for the places that legitimately want the whole set: the
 * gallery in the stories, the documentation site, the tests.
 *
 * NOTHING the library ships imports this barrel — a component imports the two or
 * three icon modules it draws, by name. Importing it from a component would pull all
 * ${entries.length} drawings back into every consumer's bundle and undo the split.
 */
export const builtinIcons = {
${names.map((name) => `  ${name},`).join('\n')}
} as const
`

  return files
}
