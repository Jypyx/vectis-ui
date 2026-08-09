/**
 * Generates `src/components/VIcon/icons.ts`: the SVG paths of the icons the DS
 * renders ITSELF by default, exact replicas of Material Symbols Rounded
 * (wght 400 · GRAD 0 · opsz 24). This registry is what makes the design system
 * usable with no icon font at all.
 *
 * Run with `pnpm icons` — on demand, NOT in prebuild: the list below only moves
 * when a component gains a new default, and the build must not depend on the
 * network (the generated file is committed).
 *
 * Source: the google/material-design-icons repository, at a pinned revision
 * (REVISION). Apache-2.0 licence © Google.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Pinned revision of the source repository (2026-07-24). */
const REVISION = '528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2'

/**
 * The icons the library renders by default — and only those: anything the
 * consumer passes in is THEIR icon source's business. Add a name here when a
 * component starts rendering a new icon by default.
 */
const ICONS = [
  'arrow_downward',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_upward',
  'attach_file',
  'audio_file',
  'calendar_today',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'cloud_upload',
  'code',
  'description',
  'error',
  'expand_less',
  'expand_more',
  'folder_zip',
  'image',
  'info',
  'more_horiz',
  'notifications',
  'pause',
  'picture_as_pdf',
  'play_arrow',
  'schedule',
  'search',
  'swap_vert',
  'table_chart',
  'video_file',
  'warning',
] as const

/** Google's export grid — the registry shares it, it is not repeated per icon. */
const VIEW_BOX = '0 -960 960 960'

const url = (name: string, fill: boolean) =>
  `https://raw.githubusercontent.com/google/material-design-icons/${REVISION}` +
  `/symbols/web/${name}/materialsymbolsrounded/${name}${fill ? '_fill1' : ''}_24px.svg`

/**
 * Extracts the file's single `d`. Fails loudly rather than producing a wrong
 * rendering: a concatenated multi-path SVG would be invalid, and a different
 * viewBox would draw the icon outside the frame.
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

async function fetchPath(name: string, fill: boolean): Promise<string | undefined> {
  const source = url(name, fill)
  const response = await fetch(source)
  if (!response.ok) {
    // The FILL 1 variant may be missing for a purely linear icon.
    if (fill && response.status === 404) return undefined
    throw new Error(`${source} : HTTP ${response.status}`)
  }
  return pathOf(await response.text(), source)
}

const entries = await Promise.all(
  ICONS.map(async (name) => {
    const [outline, filled] = await Promise.all([fetchPath(name, false), fetchPath(name, true)])
    // The filled path is emitted ONLY if it changes the geometry: most icons
    // (chevrons, arrows, close, check…) have identical FILL 0 and FILL 1.
    return [
      name,
      filled !== undefined && filled !== outline ? [outline!, filled] : [outline!],
    ] as const
  }),
)

const filledCount = entries.filter(([, paths]) => paths.length === 2).length

const ts = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm icons  ·  Source: scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ ${REVISION}
 * Apache-2.0 licence © Google.
 */

/** Material Symbols export grid, shared by every path in the registry. */
export const ICON_VIEW_BOX = '${VIEW_BOX}'

/**
 * Icons the DS renders by default, in the form \`[outline, filled?]\` — the second
 * path exists only if the FILL axis really changes the geometry.
 */
export const builtinIcons = {
${entries.map(([name, paths]) => `  ${name}: [${paths.map((d) => `'${d}'`).join(', ')}],`).join('\n')}
} as const satisfies Record<string, readonly [string] | readonly [string, string]>

/** The icon names the DS renders itself — the contract of a consumer resolver. */
export type VectisIconName = keyof typeof builtinIcons
`

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(resolve(pkgRoot, 'src/components/VIcon/icons.ts'), ts, 'utf8')

console.log(
  `icons: ${entries.length} icons (${filledCount} of them with a FILL variant) → src/components/VIcon/icons.ts`,
)
