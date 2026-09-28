// @ssr @core
// Install the icon resolver before SSR and hydration so server and client resolve the same
// drawings.
/** The way to plug a third-party icon library into the design system. */

import { shallowRef, type Component } from 'vue'

import { builtinIconNames, type IconName } from './icons/names'
import type { IconContext, IconRender } from './types'

/*
 * A lookup by name that answers only for the table's own keys: `aliases['constructor']` would
 * otherwise hand back a function from Object.prototype, and the "I do not know this name"
 * contract (`undefined`) would break for any name that happens to be one of its members.
 */
function own<T>(table: Record<string, T> | undefined, name: string): T | undefined {
  return table !== undefined && Object.hasOwn(table, name) ? table[name] : undefined
}

/**
 * Turns an icon name into a description of what to draw. Answering `undefined` means "I do not
 * know this name", and not "draw nothing": VIcon then falls back to the built-in icons, and
 * after that to the ligature font.
 */
export type IconResolver = (name: string, ctx: IconContext) => IconRender | undefined

/** A table mapping the design system's icon names to your own. */
export type IconAliases = Partial<Record<IconName, string>> & Record<string, string>

const resolver = shallowRef<IconResolver | undefined>(undefined)

/** Installs the resolver every VIcon will consult, or removes it when passed `undefined`. */
export function setIconResolver(next: IconResolver | undefined): void {
  resolver.value = next
}

/** Asks the installed resolver, if there is one. Internal to VIcon, not public API. */
export function resolveIcon(name: string, ctx: IconContext): IconRender | undefined {
  return resolver.value?.(name, ctx)
}

/**
 * A resolver for a LIGATURE font: Material Symbols in any of its variants, or an IcoMoon build
 * made that way. Installing it is also how to have the design system's own icons drawn by the
 * font instead of by the SVGs shipped with the library, and therefore how to get the optical
 * size axis back: those SVGs are drawn at one optical size and cannot follow
 * `--vectis-icon-opsz`.
 */
export function ligatureIconResolver(options: { aliases?: IconAliases } = {}): IconResolver {
  const { aliases } = options
  return (name) => ({ text: own(aliases, name) ?? name })
}

/**
 * A resolver for a font driven by a CLASS and a pseudo-element: Font Awesome, Phosphor,
 * Bootstrap Icons and their kind. `strict`, which is the default, protects the design system's
 * own icons.
 */
export function classIconResolver(options: {
  aliases?: IconAliases
  /**
   * Builds the class list for one icon. `mapped` is the alias when the table has
   * one, and the original name otherwise.
   */
  className: (mapped: string, filled: boolean) => string
  strict?: boolean
}): IconResolver {
  const { aliases, className, strict = true } = options
  return (name, ctx) => {
    const mapped = own(aliases, name)
    // The SET of names, never the icons themselves: this asks whether the design system ships
    // the name, and reaching for the drawings to answer it would make a consumer who wired in
    // their own icon library download all 34 Material paths.
    if (mapped === undefined && strict && builtinIconNames.has(name)) return undefined
    return { class: className(mapped ?? name, ctx.filled) }
  }
}

/**
 * A resolver for an icon set shipped as Vue COMPONENTS: Lucide, Untitled UI and their kind. It
 * is strict by construction, since a name absent from the table has no component to return: it
 * falls back to the built-in icons, and then to the ligature.
 */
export function componentIconResolver(options: {
  components: Partial<Record<IconName, Component>> & Record<string, Component>
  props?: (name: string, filled: boolean) => Record<string, unknown>
}): IconResolver {
  const { components, props } = options
  return (name, ctx) => {
    const component = own<Component>(components, name)
    return component ? { component, props: props?.(name, ctx.filled) } : undefined
  }
}
