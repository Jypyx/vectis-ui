/**
 * Hook for a third-party icon library. The resolver is consulted BEFORE the
 * built-in registry: that is what lets a consumer move ALL of the DS's icons onto
 * their own source.
 *
 * Module-level state rather than a Vue plugin: this is configuration, identical
 * for every request of a process, and it must stay settable from any `.ts` (a
 * Nuxt plugin, main.ts).
 */
import { shallowRef, type Component } from 'vue'

import { builtinIcons, type VectisIconName } from './icons'
import type { IconContext, IconRender } from './types'

/**
 * Translates an icon name into a render. Returning `undefined` means "I do not
 * know this name" — not "show nothing": VIcon then falls back to the built-in
 * registry, then to the ligature. That is what makes PARTIAL mappings usable
 * (map five names, keep the rest).
 */
export type IconResolver = (name: string, ctx: IconContext) => IconRender | undefined

/**
 * Mapping table "DS name → your name". The keys of the built-in registry are
 * suggested by the IDE; any other key is still accepted (your own icons are
 * allowed to be aliased too).
 */
export type IconAliases = Partial<Record<VectisIconName, string>> & Record<string, string>

const resolver = shallowRef<IconResolver | undefined>(undefined)

/**
 * Installs (or removes, with `undefined`) the global resolver.
 *
 * Call it at MODULE level — a Nuxt plugin, `main.ts` — never inside a `setup()`.
 * Under SSR the state lives in the process: correct for configuration, wrong for
 * per-request state. Beware of client-only too: a resolver set in a
 * `plugins/*.client.ts` makes server and client diverge, hence a hydration
 * mismatch.
 */
export function setIconResolver(next: IconResolver | undefined): void {
  resolver.value = next
}

/** Internal — consumed by `VIcon.vue`, not exported publicly. */
export function resolveIcon(name: string, ctx: IconContext): IconRender | undefined {
  return resolver.value?.(name, ctx)
}

/**
 * LIGATURE font: Material Symbols (every variant), a ligature IcoMoon build.
 * Answers to every name — this is also how to render the DS's icons with the font
 * rather than with the embedded SVGs, and therefore how to get back the optical
 * axis `--vectis-icon-opsz`, which the registry (drawn at opsz 24) ignores.
 */
export function ligatureIconResolver(options: { aliases?: IconAliases } = {}): IconResolver {
  const { aliases } = options
  return (name) => ({ text: aliases?.[name] ?? name })
}

/**
 * CLASS + pseudo-element font: Font Awesome, Phosphor, Bootstrap Icons…
 *
 * `strict` (the default) protects the DS's icons: a name from the built-in
 * registry that is NOT in your alias table would produce a non-existent class,
 * hence an empty square — better to let it fall back to the embedded SVG. Your
 * own names always pass: they are already written in your vocabulary.
 */
export function classIconResolver(options: {
  aliases?: IconAliases
  /** `mapped` = the alias if there is one, otherwise the name as-is. */
  className: (mapped: string, filled: boolean) => string
  strict?: boolean
}): IconResolver {
  const { aliases, className, strict = true } = options
  return (name, ctx) => {
    const mapped = aliases?.[name]
    if (mapped === undefined && strict && name in builtinIcons) return undefined
    return { class: className(mapped ?? name, ctx.filled) }
  }
}

/**
 * SVG set as Vue COMPONENTS: Lucide, Untitled UI… Strict by construction — a name
 * absent from the table falls back to the built-in registry, then to the
 * ligature. Contract: every component must have a single `<svg>` root, since that
 * is what the CSS sizes.
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
