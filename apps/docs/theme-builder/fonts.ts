/**
 * The fonts the builder offers: the library's system stacks, then every Google Fonts family.
 * Kept apart from the other options so the preview page does not load the catalogue.
 */
import { tokens } from 'vectis-ui/tokens'

import { googleFonts } from './googleFonts'

import type { DesignToken, TokenGroup } from 'vectis-ui/tokens'

/** Reads a primitive token's literal value by its path, as `font.family.sans`. */
function primitive(path: string): string {
  const node = path
    .split('.')
    .reduce<TokenGroup | DesignToken>(
      (group, key) => (group as TokenGroup)[key]!,
      tokens.primitives,
    )
  return (node as DesignToken).$value
}

/** The library's own stacks, which "System" restores. */
export const SYSTEM_SANS = primitive('font.family.sans')
export const SYSTEM_MONO = primitive('font.family.mono')

export interface FontOption {
  id: string
  label: string
  /** The Google Fonts family and the weights to request; absent for the system stacks. */
  google?: { family: string; weights: string }
  /** The full `font-family` value, fallbacks included. */
  stack: string
}

const FALLBACKS: Record<string, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  monospace: SYSTEM_MONO,
}

const option = ([family, category, weights]: (typeof googleFonts)[number]): FontOption => ({
  id: family.toLowerCase().replaceAll(' ', '-'),
  label: family,
  google: { family, weights },
  stack: `'${family}', ${FALLBACKS[category] ?? SYSTEM_SANS}`,
})

export const TEXT_FONTS: FontOption[] = [
  { id: 'system', label: 'System', stack: SYSTEM_SANS },
  ...googleFonts.map(option),
]

export const CODE_FONTS: FontOption[] = [
  { id: 'system', label: 'System', stack: SYSTEM_MONO },
  ...googleFonts.filter(([, category]) => category === 'monospace').map(option),
]

export const fontById = (list: FontOption[], id: string): FontOption =>
  list.find((font) => font.id === id) ?? list[0]!

/** The Google Fonts stylesheet for the chosen families, or nothing when all are system. */
export function googleFontsUrl(fonts: FontOption[]): string | undefined {
  const families = [
    ...new Map(fonts.filter((f) => f.google).map((f) => [f.id, f.google!])).values(),
  ]
  if (families.length === 0) return undefined
  const query = families
    .map(({ family, weights }) => `family=${family.replaceAll(' ', '+')}:wght@${weights}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}
