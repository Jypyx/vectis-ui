// @a11y
/**
 * Close when focus leaves the owner and panel. Top-layer popovers remain DOM descendants, so
 * contains covers both without document listeners.
 */

import type { Ref } from 'vue'

export function useFocusoutDismiss(
  root: Ref<HTMLElement | null>,
  close: () => void,
): (event: FocusEvent) => void {
  return (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || !root.value?.contains(next)) close()
  }
}
