/**
 * Generates `.vitepress/theme/icons.ts`: the SVG paths of the icons the DOCS CHROME
 * renders and the design system's built-in registry does not carry.
 *
 * That registry holds exactly the 34 icons a COMPONENT renders by default — anything a
 * consumer passes in is that consumer's business, and this site is a consumer. It loads
 * no icon font either, so a name the registry does not know would render nothing at all.
 * The docs therefore ship their own paths and feed them to `setIconResolver` as a PARTIAL
 * resolver: it answers for the names below and returns `undefined` for everything else,
 * which hands the request back to the built-in registry.
 *
 * Run with `pnpm --filter @vectis/docs icons` — on demand, NOT in prebuild: the list
 * below only moves when the chrome gains a new icon, and no build here may depend on the
 * network (the generated file is committed).
 *
 * Source, revision, licence and export grid are IDENTICAL to
 * `packages/ui/scripts/build-icons.ts` — the two registries have to be drawn on the same
 * grid at the same weight, or a docs icon would sit visibly off next to a DS one.
 * Apache-2.0 licence © Google.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Pinned revision of the source repository — the same one the library's registry uses. */
const REVISION = '528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2'

/** Icons the docs chrome renders. Add a name here, never a hand-written path. */
const ICONS = [
  'computer',
  'content_copy',
  'dark_mode',
  'light_mode',
  'menu',
  'open_in_new',
] as const

/** Google's export grid — shared with the library's registry, not repeated per icon. */
const VIEW_BOX = '0 -960 960 960'

const url = (name: string) =>
  `https://raw.githubusercontent.com/google/material-design-icons/${REVISION}` +
  `/symbols/web/${name}/materialsymbolsrounded/${name}_24px.svg`

/**
 * Extracts the file's single `d`. Fails loudly rather than producing a wrong rendering:
 * a concatenated multi-path SVG would be invalid, and a different viewBox would draw the
 * icon outside the frame.
 */
function pathOf(svg: string, source: string): string {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (viewBox !== VIEW_BOX) {
    throw new Error(`${source}: unexpected viewBox (${viewBox ?? 'missing'}), expected ${VIEW_BOX}`)
  }

  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]!)
  if (paths.length !== 1) {
    throw new Error(
      `${source}: ${paths.length} <path> instead of one — the registry assumes a single path`,
    )
  }
  return paths[0]!
}

/*
 * No FILL variant is fetched, unlike the library's registry: the chrome never renders a
 * filled icon, so a second path would be dead weight in a file nothing tree-shakes.
 */
const entries = await Promise.all(
  ICONS.map(async (name) => {
    const source = url(name)
    const response = await fetch(source)
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
    return [name, pathOf(await response.text(), source)] as const
  }),
)

const ts = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter @vectis/docs icons  ·  Source: scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ ${REVISION}
 * Apache-2.0 licence © Google.
 */

/** Material Symbols export grid — the same one the library's registry is drawn on. */
export const DOCS_ICON_VIEW_BOX = '${VIEW_BOX}'

/** Icons the docs chrome renders that the library's built-in registry does not carry. */
export const docsIcons = {
${entries.map(([name, d]) => `  ${name}: '${d}',`).join('\n')}
} as const satisfies Record<string, string>

/** The names this resolver answers for; every other name falls through to the library. */
export type DocsIconName = keyof typeof docsIcons
`

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(resolve(appRoot, '.vitepress/theme/icons.ts'), ts, 'utf8')

console.log(`icons: ${entries.length} icons → .vitepress/theme/icons.ts`)
