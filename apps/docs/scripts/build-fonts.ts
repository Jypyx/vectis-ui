/**
 * Generate the theme builder's Google Fonts catalogue on demand from the families' public
 * metadata. Builds use the committed catalogue without network access.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://fonts.google.com/metadata/fonts'

interface FamilyMetadata {
  family: string
  category: string
  subsets: string[]
  /** Keyed by weight, `i` marking an italic: `400`, `400i`. */
  fonts: Record<string, unknown>
  /** Rank, 1 being the most used. */
  popularity: number
}

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`${SOURCE}: HTTP ${response.status}`)
// The body starts with an anti-JSON-hijacking prefix.
const text = (await response.text()).replace(/^\)\]\}'\s*/, '')
const { familyMetadataList } = JSON.parse(text) as { familyMetadataList: FamilyMetadata[] }

/**
 * The upright weights to request: those from 400 to 700 the family has, or all of them when it
 * has none there. The API rejects a weight a static family does not have.
 */
function weightsOf(fonts: FamilyMetadata['fonts']): string {
  const upright = Object.keys(fonts)
    .filter((key) => /^\d+$/.test(key))
    .map(Number)
    .sort((a, b) => a - b)
  const body = upright.filter((weight) => weight >= 400 && weight <= 700)
  return (body.length > 0 ? body : upright).join(';')
}

// Families without Latin glyphs would show the fallback in every preview, and italic-only ones
// need another request syntax.
const entries = familyMetadataList
  .filter((font) => font.subsets.includes('latin'))
  .map((font) => ({ ...font, weights: weightsOf(font.fonts) }))
  .filter((font) => font.weights !== '')
  .sort((a, b) => a.popularity - b.popularity)
  .map(({ family, category, weights }) => [family, category.toLowerCase(), weights] as const)

const ts = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs fonts  ·  Source: scripts/build-fonts.ts
 */

/** Every Google Fonts family with Latin glyphs, most used first: family, category, weights. */
export const googleFonts: readonly (readonly [string, string, string])[] = [
${entries.map((entry) => `  ${JSON.stringify(entry)},`).join('\n')}
]
`

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(resolve(appRoot, 'theme-builder/googleFonts.ts'), ts, 'utf8')

console.log(`fonts: ${entries.length} families → theme-builder/googleFonts.ts`)
