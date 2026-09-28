import type { Component } from 'vue'

/**
 * What a resolver is told about the icon being asked for, beyond its name. It is an
 * object rather than a bare boolean so that a future need can be added without
 * changing every resolver's signature.
 */
export interface IconContext {
  /** Whether the caller asked for the filled form: VIcon's prop, VButton's `iconFilled`. */
  filled: boolean
}

/**
 * One of the icons the design system ships with: its canonical NAME together with the drawing
 * that goes with it, `[outline, filled?]` on the Material Symbols grid. A component's default
 * icon is one of these, so the name is still what reaches the consumer's resolver, and a single
 * `setIconResolver` call still moves the design system's own icons onto another icon set.
 */
export interface BuiltinIcon {
  name: string
  paths: readonly [string] | readonly [string, string]
}

/**
 * The five ways an icon can be described. Which shape wins when several are present is settled
 * by VIcon instead, in the order path, component, src, text, class.
 */
export type IconRender =
  /** SVG path data. Without a `viewBox` it is read on the Material Symbols grid. */
  | { path: string; viewBox?: string }
  /** A Vue component whose root is a SINGLE `<svg>`: that is the sizing contract. */
  | { component: Component; props?: Record<string, unknown> }
  /** An image, whether a sprite, a data URL or a file. */
  | { src: string }
  /** A ligature or codepoint font, where the text IS the glyph. */
  | { text: string; class?: string }
  /** A class-driven font, where the glyph is drawn by a `::before` these classes carry. */
  | { class: string }

/** What every icon prop in the design system accepts. */
export type IconSource = string | BuiltinIcon | IconRender
