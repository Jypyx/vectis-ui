// @a11y
/**
 * The inert link of every component that may render as an `<a>`: VButton, VChip and VAvatar.
 *
 * A link has no `disabled` attribute, so the complete inertness a `<button disabled>` gets for
 * free is rebuilt by hand, in parts that only work together. The address is dropped, so the
 * link can be neither focused nor followed; `aria-disabled` tells assistive technology why; and
 * the consumer's click listeners are filtered out of the attributes, since an `<a>` without an
 * `href` still dispatches clicks and a handler would otherwise run on a control announced as
 * disabled. TRAP — a listener written with a modifier is compiled to a key of its own
 * (`@click.capture` → `onClickCapture`, `.once` → `onClickOnce`), so the filter is a pattern
 * and not the single `onClick` key, which let those handlers run on a disabled link.
 *
 * TRAP — the attributes also gain `role="link"`. An `<a>` without `href` is no longer a link
 * but a generic element, on which an `aria-label` is PROHIBITED (axe `aria-prohibited-attr`)
 * and `aria-disabled` describes nothing: an icon-only VIconButton turned inert would lose its
 * name. The role is spread BEFORE the consumer's attributes, so a role of their own still wins —
 * which is also why it travels in the attributes and is never bound after them, where an
 * `undefined` would erase the `role="tab"` a VTab hands its button.
 *
 * Each of the three decides for itself WHEN it is a link and WHEN it is inert (VChip gives
 * `selectable` precedence over `href`, VButton counts `loading` as inert), which is why both
 * arrive as getters; the consequences are the same everywhere and live here.
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
  /** Whether that `<a>` is inert, which is what `aria-disabled` is bound to. */
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
