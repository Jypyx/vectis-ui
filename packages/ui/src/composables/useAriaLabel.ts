import { computed, useAttrs, type ComputedRef } from 'vue'

// @a11y
/**
 * Works out the name a screen reader announces for a container that has one: a row of
 * tabs, a group of buttons, a navigation area.
 *
 * A name can be given in three ways, and they are ranked. Pointing at another element
 * that already carries the text wins; an explicit name written on the component comes
 * next; the component's own `label` option is only the fallback. So that option is a
 * DEFAULT and nothing more — an explicit name replaces it, and pointing at another
 * element removes it altogether, since otherwise the element would carry two names at
 * once.
 *
 * This arbitration has to be done by hand as soon as a component both spreads the
 * attributes it was given and writes its own name in the same place: nothing would
 * choose between the two, and both would apply. Elsewhere Vue's normal attribute
 * fallthrough already lets the consumer's win, and all this does is drop a default that
 * has become redundant.
 */
export function useAriaLabel(label: () => string | undefined): ComputedRef<string | undefined> {
  const attrs = useAttrs()
  return computed(() =>
    attrs['aria-labelledby'] !== undefined
      ? undefined
      : ((attrs['aria-label'] as string | undefined) ?? label()),
  )
}
