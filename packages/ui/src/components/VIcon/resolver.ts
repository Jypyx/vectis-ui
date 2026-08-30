// @ssr @core — module-level state, to be set at module level and never
// client-only: a resolver installed after hydration is a mismatch.
/**
 * The way to plug a third-party icon library into the design system. A resolver is a
 * function turning a name into something to draw, and it is consulted BEFORE the
 * icons built into the library — which is what lets a consumer move ALL of them onto
 * their own icon set rather than ending up with two styles side by side.
 *
 * The resolver is held in module-level state rather than provided through a Vue
 * plugin, because it is configuration: identical for every request a process
 * handles, and settable from any `.ts` file — a Nuxt plugin, `main.ts` — without a
 * component being involved.
 */
import { shallowRef, type Component } from 'vue'

import { builtinIconNames, type VectisIconName } from './icons/names'
import type { IconContext, IconRender } from './types'

/**
 * Turns an icon name into a description of what to draw. Answering `undefined` means
 * "I do not know this name", and not "draw nothing": VIcon then falls back to the
 * built-in icons, and after that to the ligature font. That distinction is what
 * makes a PARTIAL mapping usable — map the five names you care about and let the
 * rest be.
 */
export type IconResolver = (name: string, ctx: IconContext) => IconRender | undefined

/**
 * A table mapping the design system's icon names to your own. The IDE suggests the
 * names the library ships with, and any other key is accepted too, so your
 * application's own icons can be aliased through the same table.
 */
export type IconAliases = Partial<Record<VectisIconName, string>> & Record<string, string>

const resolver = shallowRef<IconResolver | undefined>(undefined)

/**
 * Installs the resolver every VIcon will consult, or removes it when passed
 * `undefined`.
 *
 * Call it at MODULE level — from a Nuxt plugin or from `main.ts` — and never inside
 * a component's `setup()`. Two traps follow from where the state lives. On a server
 * it belongs to the process rather than to a request, which is right for
 * configuration and wrong for anything varying per visitor. And installing it on the
 * client only, from a `plugins/*.client.ts`, makes the browser draw different icons
 * from the ones the server sent, which is a hydration mismatch.
 */
export function setIconResolver(next: IconResolver | undefined): void {
  resolver.value = next
}

/** Asks the installed resolver, if there is one. Internal to VIcon, not public API. */
export function resolveIcon(name: string, ctx: IconContext): IconRender | undefined {
  return resolver.value?.(name, ctx)
}

/**
 * A resolver for a LIGATURE font — Material Symbols in any of its variants, or an
 * IcoMoon build made that way. It answers to every name, since the font itself
 * decides what it recognizes.
 *
 * Installing it is also how to have the design system's own icons drawn by the font
 * instead of by the SVGs shipped with the library, and therefore how to get the
 * optical size axis back: those SVGs are drawn at one optical size and cannot follow
 * `--vectis-icon-opsz`.
 */
export function ligatureIconResolver(options: { aliases?: IconAliases } = {}): IconResolver {
  const { aliases } = options
  return (name) => ({ text: aliases?.[name] ?? name })
}

/**
 * A resolver for a font driven by a CLASS and a pseudo-element: Font Awesome,
 * Phosphor, Bootstrap Icons and their kind.
 *
 * `strict`, which is the default, protects the design system's own icons. One of its
 * names that is NOT in your alias table would otherwise be turned into a class the
 * font does not define, and the icon would render as an empty square; refusing to
 * answer instead lets it fall back to the SVG shipped with the library. Names of
 * your own always pass, since they are already written in your vocabulary.
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
    const mapped = aliases?.[name]
    // The SET of names, never the icons themselves: this asks whether the design
    // system ships the name, and reaching for the drawings to answer it would make a
    // consumer who wired in their OWN icon library download all 34 Material paths.
    if (mapped === undefined && strict && builtinIconNames.has(name)) return undefined
    return { class: className(mapped ?? name, ctx.filled) }
  }
}

/**
 * A resolver for an icon set shipped as Vue COMPONENTS: Lucide, Untitled UI and
 * their kind. It is strict by construction, since a name absent from the table has
 * no component to return: it falls back to the built-in icons, and then to the
 * ligature.
 *
 * One contract to honour: each component must have a single `<svg>` as its root,
 * because that is the element the stylesheet sizes.
 */
export function componentIconResolver(options: {
  components: Partial<Record<VectisIconName, Component>> & Record<string, Component>
  props?: (name: string, filled: boolean) => Record<string, unknown>
}): IconResolver {
  const { components, props } = options
  return (name, ctx) => {
    const component = components[name]
    return component ? { component, props: props?.(name, ctx.filled) } : undefined
  }
}
