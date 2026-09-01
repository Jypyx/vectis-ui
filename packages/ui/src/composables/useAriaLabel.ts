// @a11y
/**
 * The accessible name of a labelled container — a tablist, a group, a nav — resolved
 * `aria-labelledby` > consumer `aria-label` > the `label` prop.
 *
 * `label` is therefore only a default: `aria-label` replaces it, and `aria-labelledby`
 * removes it outright, or the element would carry two names at once.
 *
 * The arbitration is only NEEDED where a component both spreads `$attrs` and binds its own
 * `:aria-label` on the same element (VTabs, VToggle): nothing would choose, and both would
 * apply. Elsewhere fallthrough already lets the consumer win and this just drops a default
 * that has become redundant.
 */

import { computed, useAttrs, type ComputedRef } from 'vue'

export function useAriaLabel(label: () => string | undefined): ComputedRef<string | undefined> {
  const attrs = useAttrs()
  return computed(() =>
    attrs['aria-labelledby'] !== undefined
      ? undefined
      : ((attrs['aria-label'] as string | undefined) ?? label()),
  )
}
