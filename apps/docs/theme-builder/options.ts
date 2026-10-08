/** The closed lists the builder offers: icon libraries, radius presets and root sizes. */
import { ICON_ALIASES } from './iconAliases'

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

export type RadiusPresetId = 'none' | 'small' | 'medium' | 'large' | 'extra' | 'full'

/** The library's pill radius, which the generated theme names rather than spells. */
export const RADIUS_FULL = 9999

/** Each preset in pixels. Medium is the library's default; chips follow the controls. */
export const RADIUS_PRESETS: Record<RadiusPresetId, Record<RadiusRole, number>> = {
  none: { interactive: 0, surface: 0, overlay: 0, chip: 0 },
  small: { interactive: 4, surface: 6, overlay: 8, chip: 4 },
  medium: { interactive: 6, surface: 8, overlay: 12, chip: 6 },
  large: { interactive: 8, surface: 12, overlay: 16, chip: 8 },
  extra: { interactive: 12, surface: 16, overlay: 24, chip: 12 },
  full: { interactive: RADIUS_FULL, surface: 16, overlay: 24, chip: RADIUS_FULL },
}

export const BASE_SIZES = [14, 15, 16, 17, 18] as const
export type BaseSize = (typeof BASE_SIZES)[number]
