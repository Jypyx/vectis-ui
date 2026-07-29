/**
 * Génère `src/components/Icon/icons.ts` : les paths SVG des icônes que le DS
 * rend LUI-MÊME par défaut, répliques exactes de Material Symbols Rounded
 * (wght 400 · GRAD 0 · opsz 24). C'est ce registre qui rend le design system
 * utilisable sans aucune police d'icônes.
 *
 * Exécution : `pnpm icons` — à la demande, PAS en prebuild : la liste ci-dessous
 * ne bouge qu'en ajoutant un défaut à un composant, et le build ne doit pas
 * dépendre du réseau (le fichier généré est committé).
 *
 * Source : dépôt google/material-design-icons, révision épinglée (REVISION).
 * Licence Apache-2.0 © Google.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Révision épinglée du dépôt source (2026-07-24). */
const REVISION = '528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2'

/**
 * Les icônes rendues par défaut par la librairie — et elles seules : tout ce que
 * le consommateur passe lui-même relève de SA source d'icônes. Ajouter un nom
 * ici quand un composant se met à rendre une nouvelle icône par défaut.
 */
const ICONS = [
  'arrow_downward',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_upward',
  'calendar_today',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'error',
  'expand_less',
  'expand_more',
  'info',
  'more_horiz',
  'notifications',
  'schedule',
  'search',
  'swap_vert',
  'warning',
] as const

/** Grille d'export de Google — le registre la partage, elle n'est pas répétée par icône. */
const VIEW_BOX = '0 -960 960 960'

const url = (name: string, fill: boolean) =>
  `https://raw.githubusercontent.com/google/material-design-icons/${REVISION}` +
  `/symbols/web/${name}/materialsymbolsrounded/${name}${fill ? '_fill1' : ''}_24px.svg`

/**
 * Extrait le `d` unique du fichier. Échoue bruyamment plutôt que de produire un
 * rendu faux : un SVG multi-path concaténé serait invalide, et un autre viewBox
 * dessinerait l'icône hors du cadre.
 */
function pathOf(svg: string, source: string): string {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (viewBox !== VIEW_BOX) {
    throw new Error(`${source} : viewBox inattendu (${viewBox ?? 'absent'}), attendu ${VIEW_BOX}`)
  }

  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]!)
  if (paths.length !== 1) {
    throw new Error(
      `${source} : ${paths.length} <path> au lieu d'un seul — le registre suppose un path unique`,
    )
  }
  return paths[0]!
}

async function fetchPath(name: string, fill: boolean): Promise<string | undefined> {
  const source = url(name, fill)
  const response = await fetch(source)
  if (!response.ok) {
    // La variante FILL 1 peut manquer pour une icône purement linéaire.
    if (fill && response.status === 404) return undefined
    throw new Error(`${source} : HTTP ${response.status}`)
  }
  return pathOf(await response.text(), source)
}

const entries = await Promise.all(
  ICONS.map(async (name) => {
    const [outline, filled] = await Promise.all([fetchPath(name, false), fetchPath(name, true)])
    // Le path plein n'est émis QUE s'il change la géométrie : une majorité des
    // icônes (chevrons, flèches, close, check…) ont FILL 0 et FILL 1 identiques.
    return [
      name,
      filled !== undefined && filled !== outline ? [outline!, filled] : [outline!],
    ] as const
  }),
)

const filledCount = entries.filter(([, paths]) => paths.length === 2).length

const ts = `/*
 * FICHIER GÉNÉRÉ — ne pas éditer à la main.
 * Régénérer : pnpm icons  ·  Source : scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ ${REVISION}
 * Licence Apache-2.0 © Google.
 */

/** Grille d'export Material Symbols, partagée par tous les paths du registre. */
export const ICON_VIEW_BOX = '${VIEW_BOX}'

/**
 * Icônes rendues par défaut par le DS, sous la forme \`[contour, plein?]\` — le
 * second path n'existe que si l'axe FILL change réellement la géométrie.
 */
export const builtinIcons = {
${entries.map(([name, paths]) => `  ${name}: [${paths.map((d) => `'${d}'`).join(', ')}],`).join('\n')}
} as const satisfies Record<string, readonly [string] | readonly [string, string]>

/** Les noms d'icônes que le DS rend lui-même — contrat d'un résolveur consommateur. */
export type DsIconName = keyof typeof builtinIcons
`

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(resolve(pkgRoot, 'src/components/Icon/icons.ts'), ts, 'utf8')

console.log(
  `icons: ${entries.length} icônes (dont ${filledCount} avec variante FILL) → src/components/Icon/icons.ts`,
)
