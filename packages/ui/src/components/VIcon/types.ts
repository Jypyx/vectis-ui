import type { Component } from 'vue'

/**
 * What a resolver is told about the icon being asked for, beyond its name. It is an
 * object rather than a bare boolean so that a future need can be added without
 * changing every resolver's signature.
 */
export interface IconContext {
  /** Whether the caller asked for the filled form — VIcon's prop, VButton's `iconFilled`. */
  filled: boolean
}

/**
 * The five ways an icon can be described. Between them they cover every family of
 * icon source in use: raw SVG paths, icon sets shipped as components (Lucide,
 * Untitled UI), sprites and image files, ligature or codepoint fonts (Material,
 * IcoMoon), and fonts driven by a class and a pseudo-element (Font Awesome,
 * Phosphor, Bootstrap Icons).
 *
 * The union carries no discriminating field, because this is what a consumer writes
 * by hand and there would be nothing for them to tag it with. Which shape wins when
 * several are present is settled by VIcon instead, in the order path, component,
 * src, text, class.
 */
/**
 * One of the icons the design system ships with: its canonical NAME together with the
 * drawing that goes with it, `[outline, filled?]` on the Material Symbols grid — the
 * second path is only there when filling actually changes the geometry.
 *
 * The name travelling WITH the drawing is the whole point of the shape. A component's
 * default icon is one of these, so the name is still what reaches the consumer's
 * resolver, and a single `setIconResolver` call still moves the design system's own
 * icons onto another icon set. Were a default a bare `{ path }`, it would take the
 * `render` route, the resolver would never be asked, and the library's internals
 * would stay Material for a consumer who had wired in their own library.
 *
 * A consumer never writes one by hand: they are imported from `vectis-ui/icons`.
 */
export interface BuiltinIcon {
  name: string
  paths: readonly [string] | readonly [string, string]
}

export type IconRender =
  /** SVG path data. Without a `viewBox` it is read on the Material Symbols grid. */
  | { path: string; viewBox?: string }
  /** A Vue component whose root is a SINGLE `<svg>` — that is the sizing contract. */
  | { component: Component; props?: Record<string, unknown> }
  /** An image, whether a sprite, a data URL or a file. */
  | { src: string }
  /** A ligature or codepoint font, where the text IS the glyph. */
  | { text: string; class?: string }
  /** A class-driven font, where the glyph is drawn by a `::before` these classes carry. */
  | { class: string }

/**
 * What every icon prop in the design system accepts. There is deliberately NO
 * guesswork: a plain string is ALWAYS a name, and an image or a component is
 * declared explicitly as an object, `{ src: '/logo.svg' }`.
 *
 * That is what allows any naming convention — `mdi:close`, `fa6-solid:xmark` — to
 * reach the resolver intact, where a heuristic would have taken it for an address.
 *
 * A `BuiltinIcon` imported from `vectis-ui/icons` is accepted too, and behaves
 * exactly like the name it carries: the resolver is asked first, and the drawing it
 * brought along is used only if nothing answered.
 */
export type IconSource = string | BuiltinIcon | IconRender
