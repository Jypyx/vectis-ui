import { computed, useAttrs, type ComputedRef } from 'vue'

// @a11y
/**
 * Accessible name of a named container (tablist, group, nav…) following the ARIA
 * precedence: `aria-labelledby` > `aria-label` > `label` prop.
 *
 * The `label` prop is only a DEFAULT. A consumer `aria-label` replaces it; an
 * `aria-labelledby` removes it, otherwise both names would coexist on the
 * element.
 *
 * Required as soon as the component is in `inheritAttrs: false` and renders both
 * `v-bind="forwardedAttrs"` **and** `:aria-label`: without arbitration, both
 * apply. Under natural fallthrough, Vue already lets the consumer's attribute
 * win — there the composable only removes the now-redundant default.
 */
export function useAriaLabel(label: () => string | undefined): ComputedRef<string | undefined> {
  const attrs = useAttrs()
  return computed(() =>
    attrs['aria-labelledby'] !== undefined
      ? undefined
      : ((attrs['aria-label'] as string | undefined) ?? label()),
  )
}
