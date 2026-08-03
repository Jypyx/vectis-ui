import type { Component } from 'vue'

/** Context of an icon request. An object rather than a bare boolean, to stay extensible. */
export interface IconContext {
  /** `filled` as requested by the caller (VIcon's prop, VButton's `iconFilled`…). */
  filled: boolean
}

/**
 * The five rendering shapes of an icon — they cover the four families of source
 * on the market: raw paths, SVG sets as components (Lucide, Untitled UI),
 * sprites/URLs, ligature or codepoint fonts (Material, IcoMoon), and class +
 * pseudo-element fonts (Font Awesome, Phosphor, Bootstrap Icons).
 *
 * An untagged union: this is what the consumer writes by hand, so there is
 * nothing for them to tag. Precedence is fixed on the VIcon side, in this order:
 * path > component > src > text > class.
 */
export type IconRender =
  /** SVG path data. Default `viewBox`: the Material Symbols grid. */
  | { path: string; viewBox?: string }
  /** A Vue component with a SINGLE `<svg>` root (the sizing contract). */
  | { component: Component; props?: Record<string, unknown> }
  /** An image: sprite, data URL, file. */
  | { src: string }
  /** A ligature or codepoint font: the text IS the glyph. */
  | { text: string; class?: string }
  /** A class font: the glyph comes from a `::before` carried by these classes. */
  | { class: string }

/**
 * What every icon prop in the DS accepts. **No heuristic**: a string is ALWAYS an
 * icon name, while a URL or a component goes explicitly through an object
 * (`{ src: '/logo.svg' }`). That is what lets any naming convention
 * (`mdi:close`, `fa6-solid:xmark`) reach the resolver instead of being taken for
 * a URL.
 */
export type IconSource = string | IconRender
