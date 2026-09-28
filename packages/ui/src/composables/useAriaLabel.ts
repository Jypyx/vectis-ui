// @a11y
/**
 * Resolve accessible names in order: aria-labelledby, consumer aria-label, label fallback.
 * Suppress aria-label when aria-labelledby names the element.
 */

import { computed, useAttrs, type ComputedRef } from 'vue'

export function useAriaLabel(label: () => string | undefined): ComputedRef<string | undefined> {
  const attrs = useAttrs()
  return computed(() =>
    attrs['aria-labelledby'] != null
      ? undefined
      : ((attrs['aria-label'] as string | undefined) ?? label()),
  )
}
