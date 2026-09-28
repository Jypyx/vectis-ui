// @a11y
/**
 * Anchors have no disabled state: remove href, mark the link disabled and filter every
 * click-listener modifier. Keep role=link when href is absent.
 */
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

export interface InertLinkOptions {
  /** The address the component would link to, or `undefined` when it is not a link. */
  href: () => string | undefined
  /** Whether the component is unusable right now. */
  inert: () => boolean
  /** The attributes the component forwards to the element that acts. */
  attrs: () => Record<string, unknown>
}

export interface InertLink {
  /** Whether the component renders an `<a>`. */
  isLink: ComputedRef<boolean>
  /** Whether that `<a>` is inert, which `aria-disabled` is bound to. */
  isInertLink: ComputedRef<boolean>
  /** The `href` to bind: the address, or nothing on an inert link. */
  linkHref: ComputedRef<string | undefined>
  /** The attributes to bind, without the click handler on an inert link. */
  attrs: ComputedRef<Record<string, unknown>>
}

/** `onClick` and the keys Vue compiles its event modifiers to, in any combination. */
const CLICK_LISTENER = /^onClick(?:Once|Capture|Passive)*$/

export function useInertLink(options: InertLinkOptions): InertLink {
  const isLink = computed(() => options.href() !== undefined)
  const isInertLink = computed(() => isLink.value && options.inert())
  return {
    isLink,
    isInertLink,
    linkHref: computed(() => (isInertLink.value ? undefined : options.href())),
    attrs: computed(() => {
      const attrs = options.attrs()
      if (!isInertLink.value) return attrs
      const rest: Record<string, unknown> = { role: 'link', ...attrs }
      for (const key of Object.keys(rest)) if (CLICK_LISTENER.test(key)) delete rest[key]
      return rest
    }),
  }
}
