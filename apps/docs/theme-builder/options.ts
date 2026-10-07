/**
 * The closed lists the builder offers: fonts, icon libraries, radius presets and root sizes.
 * Google Fonts weights are each family's real ones, since the API rejects or substitutes a
 * weight a static family does not have.
 */
import { tokens } from 'vectis-ui/tokens'

import { ICON_ALIASES } from './iconAliases'

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

const sans = (family: string, weights = '400;500;600;700'): FontOption => ({
  id: family.toLowerCase().replaceAll(' ', '-'),
  label: family,
  google: { family, weights },
  stack: `'${family}', ${SYSTEM_SANS}`,
})
const serif = (family: string): FontOption => ({
  ...sans(family),
  stack: `'${family}', Georgia, 'Times New Roman', serif`,
})
const mono = (family: string): FontOption => ({
  ...sans(family, '400;500;600;700'),
  stack: `'${family}', ${SYSTEM_MONO}`,
})

const SYSTEM: FontOption = { id: 'system', label: 'System', stack: SYSTEM_SANS }

export const HEADING_FONTS: FontOption[] = [
  SYSTEM,
  sans('Geist'),
  sans('Inter'),
  sans('Josefin Sans'),
  sans('Poppins'),
  sans('Montserrat'),
  sans('Space Grotesk'),
  serif('Playfair Display'),
  serif('Fraunces'),
]

export const BODY_FONTS: FontOption[] = [
  SYSTEM,
  sans('Geist'),
  sans('Inter'),
  sans('Roboto'),
  sans('Open Sans'),
  sans('Lato', '400;700'),
  sans('IBM Plex Sans'),
  sans('Source Sans 3'),
  sans('Nunito Sans'),
]

export const CODE_FONTS: FontOption[] = [
  { id: 'system', label: 'System', stack: SYSTEM_MONO },
  mono('Geist Mono'),
  mono('JetBrains Mono'),
  mono('Fira Code'),
  mono('IBM Plex Mono'),
  mono('Source Code Pro'),
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

export type IconLibraryId =
  | 'material-rounded'
  | 'material-outlined'
  | 'material-sharp'
  | 'lucide'
  | 'heroicons'
  | 'phosphor'
  | 'tabler'
  | 'remix'
  | 'fontawesome'
  | 'bootstrap'

interface IconLibraryBase {
  id: IconLibraryId
  label: string
  /** The package to install, when the library comes from npm. */
  package?: string
}

/** The design system's own SVGs: nothing to install or configure. */
interface BuiltinLibrary extends IconLibraryBase {
  kind: 'builtin'
}

/** A Material Symbols variant drawn by its ligature font. */
interface LigatureLibrary extends IconLibraryBase {
  kind: 'ligature'
  fontFamily: string
}

/** A webfont whose glyphs are drawn by a class. */
interface ClassLibrary extends IconLibraryBase {
  kind: 'class'
  aliases: Record<string, string>
  /** The `className` function, as the generated code spells it. */
  classNameSource: string
  /** The same function, run by the preview. */
  className: (name: string, filled: boolean) => string
  /** What the consumer imports, and the CDN copies of those files the preview loads. */
  imports: string[]
  cdn: string[]
}

/** Vue components, one per icon. */
interface ComponentLibrary extends IconLibraryBase {
  kind: 'component'
  aliases: Record<string, string>
  /** The module the components are imported from. */
  from: string
  /** Props passed for the filled form, and the same props as the generated code spells them. */
  filledProps?: Record<string, unknown>
  filledPropsSource?: string
}

export type IconLibrary = BuiltinLibrary | LigatureLibrary | ClassLibrary | ComponentLibrary

const MATERIAL_AXES = 'opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'

/** The Google Fonts stylesheet of a Material Symbols variant. */
export const materialFontUrl = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:${MATERIAL_AXES}&display=block`

const JSDELIVR = 'https://cdn.jsdelivr.net/npm'

export const ICON_LIBRARIES: IconLibrary[] = [
  { id: 'material-rounded', label: 'Material Symbols Rounded', kind: 'builtin' },
  {
    id: 'material-outlined',
    label: 'Material Symbols Outlined',
    kind: 'ligature',
    fontFamily: 'Material Symbols Outlined',
  },
  {
    id: 'material-sharp',
    label: 'Material Symbols Sharp',
    kind: 'ligature',
    fontFamily: 'Material Symbols Sharp',
  },
  {
    id: 'lucide',
    label: 'Lucide',
    kind: 'component',
    package: '@lucide/vue',
    from: '@lucide/vue',
    aliases: ICON_ALIASES.lucide,
    filledProps: { fill: 'currentColor' },
    filledPropsSource: "{ fill: 'currentColor' }",
  },
  {
    id: 'heroicons',
    label: 'Heroicons',
    kind: 'component',
    package: '@heroicons/vue',
    from: '@heroicons/vue/24/outline',
    aliases: ICON_ALIASES.heroicons,
  },
  {
    id: 'phosphor',
    label: 'Phosphor',
    kind: 'class',
    package: '@phosphor-icons/web',
    aliases: ICON_ALIASES.phosphor,
    classNameSource: "(name, filled) => `${filled ? 'ph-fill' : 'ph'} ph-${name}`",
    className: (name, filled) => `${filled ? 'ph-fill' : 'ph'} ph-${name}`,
    imports: ['@phosphor-icons/web/regular', '@phosphor-icons/web/fill'],
    cdn: [
      `${JSDELIVR}/@phosphor-icons/web@2.1.2/src/regular/style.css`,
      `${JSDELIVR}/@phosphor-icons/web@2.1.2/src/fill/style.css`,
    ],
  },
  {
    id: 'tabler',
    label: 'Tabler Icons',
    kind: 'class',
    package: '@tabler/icons-webfont',
    aliases: ICON_ALIASES.tabler,
    classNameSource: '(name) => `ti ti-${name}`',
    className: (name) => `ti ti-${name}`,
    imports: ['@tabler/icons-webfont/dist/tabler-icons.min.css'],
    cdn: [`${JSDELIVR}/@tabler/icons-webfont@3.49.0/dist/tabler-icons.min.css`],
  },
  {
    id: 'remix',
    label: 'Remix Icon',
    kind: 'class',
    package: 'remixicon',
    aliases: ICON_ALIASES.remix,
    classNameSource: "(name, filled) => `ri-${name}-${filled ? 'fill' : 'line'}`",
    className: (name, filled) => `ri-${name}-${filled ? 'fill' : 'line'}`,
    imports: ['remixicon/fonts/remixicon.css'],
    cdn: [`${JSDELIVR}/remixicon@4.9.1/fonts/remixicon.css`],
  },
  {
    id: 'fontawesome',
    label: 'Font Awesome Free',
    kind: 'class',
    package: '@fortawesome/fontawesome-free',
    aliases: ICON_ALIASES.fontawesome,
    classNameSource: '(name) => `fa-solid fa-${name}`',
    className: (name) => `fa-solid fa-${name}`,
    imports: ['@fortawesome/fontawesome-free/css/all.min.css'],
    cdn: [`${JSDELIVR}/@fortawesome/fontawesome-free@7.3.1/css/all.min.css`],
  },
  {
    id: 'bootstrap',
    label: 'Bootstrap Icons',
    kind: 'class',
    package: 'bootstrap-icons',
    aliases: ICON_ALIASES.bootstrap,
    classNameSource: '(name) => `bi bi-${name}`',
    className: (name) => `bi bi-${name}`,
    imports: ['bootstrap-icons/font/bootstrap-icons.min.css'],
    cdn: [`${JSDELIVR}/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css`],
  },
]

export const iconLibraryById = (id: IconLibraryId): IconLibrary =>
  ICON_LIBRARIES.find((library) => library.id === id) ?? ICON_LIBRARIES[0]!

export type RadiusRole = 'interactive' | 'surface' | 'overlay' | 'chip'
export const RADIUS_ROLES: RadiusRole[] = ['interactive', 'surface', 'overlay', 'chip']

export type RadiusPresetId = 'none' | 'small' | 'medium' | 'large' | 'extra'

/** Each preset in pixels. Medium is the library's default; chips follow the controls. */
export const RADIUS_PRESETS: Record<RadiusPresetId, Record<RadiusRole, number>> = {
  none: { interactive: 0, surface: 0, overlay: 0, chip: 0 },
  small: { interactive: 4, surface: 6, overlay: 8, chip: 4 },
  medium: { interactive: 6, surface: 8, overlay: 12, chip: 6 },
  large: { interactive: 8, surface: 12, overlay: 16, chip: 8 },
  extra: { interactive: 12, surface: 16, overlay: 24, chip: 12 },
}

export const BASE_SIZES = [14, 15, 16, 17, 18] as const
export type BaseSize = (typeof BASE_SIZES)[number]
