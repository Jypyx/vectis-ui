/**
 * The Design tokens page's data: every semantic token the library ships, sorted into the
 * sections the page prints, each with its description and its default value in both themes.
 *
 * Nothing here is written by hand except the SORTING. The names, the values and the English
 * descriptions are read from `vectis-ui/tokens`, the same typed source `tokens.css` is generated
 * from, so the reference cannot list a token the stylesheet lacks or a value it no longer holds.
 * A token the sorting does not place throws when this module loads, which fails `nuxt generate`
 * rather than dropping a row from the page: adding a role to the library without deciding where
 * it is documented is the one mistake this file exists to catch.
 *
 * Only the semantic layer is listed. The primitives are what a value points at, and each value
 * shows that reference, so the palettes and scales appear here through the roles that use them.
 */
import { flattenTokens, resolveTokenValue, tokens, type DesignToken } from 'vectis-ui/tokens'

import type { DocsSlug } from './nav'

/** The dash-joined leaf paths of a token group, as a union of literal types. */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends DesignToken ? K : `${K}-${Leaves<T[K]>}`
}[keyof T & string]

type Semantic = typeof tokens.semantic
type Text = Semantic['text']

/** Every semantic custom property the library declares. */
export type SemanticToken = `--vectis-${Leaves<Semantic>}`

/** A text role: a group of the `text` tokens, as opposed to one of the three family tokens. */
export type TextRole = { [K in keyof Text]: Text[K] extends DesignToken ? never : K }[keyof Text]

/**
 * The tokens described one by one. The text recipes are described per ROLE instead, on the row
 * holding their four values, so their descriptions live in the catalogue under `roles`.
 */
export type DescribedToken = Exclude<SemanticToken, `--vectis-text-${TextRole}-${string}`>

export interface TokenValue {
  /** The value once every reference is followed: a colour, a length, a font stack. */
  resolved: string
  /** The value as the stylesheet writes it, when it points at another token. */
  reference?: string
}

export interface TokenRow {
  name: DescribedToken
  light: TokenValue
  /** Set when the dark theme assigns the role a value of its own. */
  dark?: TokenValue
  isColor: boolean
}

export interface TokenRowGroup {
  /** The catalogue key naming the group, under `designTokens.groups`. */
  label?: string
  /** The component pages a group of component dimensions links to. */
  slugs?: DocsSlug[]
  rows: TokenRow[]
}

export interface TextRoleRow {
  role: TextRole
  size?: TokenValue
  weight?: TokenValue
  leading?: TokenValue
  tracking?: TokenValue
}

const ALIAS_RE = /\{([^}]+)\}/g

const cssNameOf = (ref: string) => `--vectis-${ref.trim().split('.').join('-')}`

const primitiveFlat = flattenTokens(tokens.primitives)
const semanticFlat = flattenTokens(tokens.semantic)
const darkFlat = flattenTokens(tokens.themes.dark)

const known = new Set([...primitiveFlat, ...semanticFlat].map((f) => f.cssName))

const lightValues = new Map([...primitiveFlat, ...semanticFlat].map((f) => [f.cssName, f.token]))
const darkValues = new Map([...lightValues, ...darkFlat.map((f) => [f.cssName, f.token] as const)])
const darkNames = new Set(darkFlat.map((f) => f.cssName))

function resolve(value: string, values: Map<string, DesignToken>): string {
  return value.replace(ALIAS_RE, (_match, ref: string) => {
    const target = values.get(cssNameOf(ref))
    if (!target) throw new Error(`[design tokens] Unknown alias {${ref}}`)
    return resolve(target.$value, values)
  })
}

function valueOf(token: DesignToken, values: Map<string, DesignToken>): TokenValue {
  const reference = resolveTokenValue(token.$value, known)
  const resolved = resolve(token.$value, values)
  return reference === resolved ? { resolved } : { resolved, reference }
}

const rowOf = (name: string): TokenRow => {
  const light = lightValues.get(name)!
  const darkToken = darkValues.get(name)!
  return {
    name: name as DescribedToken,
    light: valueOf(light, lightValues),
    dark: darkNames.has(name) ? valueOf(darkToken, darkValues) : undefined,
    isColor: light.$type === 'color',
  }
}

/*
 * Every semantic token is claimed exactly once by the sections below. `claim` removes what it
 * takes from this set, and whatever is left at the end is a token no section documents.
 */
const unclaimed = new Set(semanticFlat.map((f) => f.cssName))

function claim(test: (name: string) => boolean): string[] {
  const names = semanticFlat
    .map((f) => f.cssName)
    .filter((name) => unclaimed.has(name) && test(name))
  for (const name of names) unclaimed.delete(name)
  return names
}

const byPrefix = (prefix: string) => (name: string) => name.startsWith(prefix)

/** The colour roles, in the families the page groups them by. */
const COLOR_GROUPS = [
  'surfaces',
  'text',
  'borders',
  'accent',
  'danger',
  'success',
  'warning',
  'backdrop',
  'events',
] as const

const COLOR_PREFIX: Record<(typeof COLOR_GROUPS)[number], string> = {
  surfaces: '--vectis-color-surface',
  text: '--vectis-color-text',
  borders: '--vectis-color-border',
  accent: '--vectis-color-accent',
  danger: '--vectis-color-danger',
  success: '--vectis-color-success',
  warning: '--vectis-color-warning',
  backdrop: '--vectis-color-backdrop',
  events: '--vectis-color-event',
}

export const colorGroups: TokenRowGroup[] = COLOR_GROUPS.map((group) => ({
  label: group,
  rows: claim(byPrefix(COLOR_PREFIX[group])).map(rowOf),
}))

export const focusRows: TokenRow[] = claim(byPrefix('--vectis-focus-')).map(rowOf)

export const familyRows: TokenRow[] = claim(byPrefix('--vectis-text-family')).map(rowOf)

export const textRoleRows: TextRoleRow[] = (Object.keys(tokens.semantic.text) as (keyof Text)[])
  .filter((key): key is TextRole => !lightValues.has(`--vectis-text-${key}`))
  .map((role) => {
    const prefix = `--vectis-text-${role}-`
    const values: TextRoleRow = { role }
    for (const name of claim(byPrefix(prefix))) {
      const part = name.slice(prefix.length) as 'size' | 'weight' | 'leading' | 'tracking'
      values[part] = valueOf(lightValues.get(name)!, lightValues)
    }
    return values
  })

export const radiusRows: TokenRow[] = claim(byPrefix('--vectis-radius-')).map(rowOf)

export const durationRows: TokenRow[] = claim(byPrefix('--vectis-duration-')).map(rowOf)

export const sizeGroups: TokenRowGroup[] = [
  { label: 'controlHeights', rows: claim(byPrefix('--vectis-control-height-')).map(rowOf) },
  { label: 'iconSizes', rows: claim(byPrefix('--vectis-icon-size-')).map(rowOf) },
]

/**
 * Which component each dimension token belongs to, by the part of its name after
 * `--vectis-control-`. Alphabetical by page, the order of the navigation rail.
 */
const COMPONENT_DIMENSIONS: { slugs: DocsSlug[]; prefixes: string[] }[] = [
  { slugs: ['avatar-group'], prefixes: ['size-avatar-'] },
  { slugs: ['badge'], prefixes: ['size-badge-'] },
  { slugs: ['calendar'], prefixes: ['size-calendar-'] },
  { slugs: ['carousel'], prefixes: ['size-carousel-'] },
  { slugs: ['checkbox', 'radio'], prefixes: ['border-width', 'size-check'] },
  { slugs: ['combobox'], prefixes: ['size-combobox-'] },
  { slugs: ['data-table'], prefixes: ['size-table-'] },
  { slugs: ['date-picker'], prefixes: ['size-date-picker-'] },
  { slugs: ['dialog'], prefixes: ['size-dialog-'] },
  { slugs: ['file-picker'], prefixes: ['size-file-picker-'] },
  { slugs: ['input'], prefixes: ['action-size-'] },
  { slugs: ['menu'], prefixes: ['size-menu-'] },
  { slugs: ['progress-circular'], prefixes: ['size-progress-circular-'] },
  { slugs: ['progress-linear'], prefixes: ['size-progress-linear-'] },
  { slugs: ['skeleton-loader'], prefixes: ['size-skeleton-'] },
  { slugs: ['slider'], prefixes: ['size-slider-'] },
  { slugs: ['snackbar'], prefixes: ['size-snackbar-'] },
  { slugs: ['switch'], prefixes: ['size-switch-'] },
  { slugs: ['tabs'], prefixes: ['size-tab-'] },
  { slugs: ['time-picker'], prefixes: ['size-time-picker-'] },
  { slugs: ['toast'], prefixes: ['size-toast-'] },
]

export const componentGroups: TokenRowGroup[] = COMPONENT_DIMENSIONS.map(({ slugs, prefixes }) => ({
  slugs,
  rows: claim((name) => prefixes.some((p) => name.startsWith(`--vectis-control-${p}`))).map(rowOf),
}))

if (unclaimed.size > 0) {
  throw new Error(`[design tokens] No section of the page documents: ${[...unclaimed].join(', ')}`)
}

for (const group of [...colorGroups, ...sizeGroups, ...componentGroups]) {
  if (group.rows.length === 0) {
    throw new Error(`[design tokens] Empty group: ${group.label ?? group.slugs?.join(', ')}`)
  }
}

/**
 * The English descriptions, read from the source. The English catalogue publishes this record
 * as it stands, and the French one is typed against the same keys.
 */
export const tokenDescriptions = Object.fromEntries(
  semanticFlat
    .filter((f) => f.token.$description !== undefined)
    .map((f) => [f.cssName, f.token.$description!]),
) as Record<DescribedToken, string>
