// @a11y
/**
 * Close when focus leaves the owner and panel. Top-layer popovers remain DOM descendants, so
 * contains covers both without document listeners.
 */

import { nextTick } from 'vue'
import type { Ref } from 'vue'

export function useFocusoutDismiss(
  root: Ref<HTMLElement | null>,
  close: () => void,
): (event: FocusEvent) => void {
  return (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next) {
      if (!root.value?.contains(next)) close()
      return
    }
    // Chromium also fires a destination-less focusout when a re-render removes the focused
    // element (VDatePicker swapping its months view for the days). The owner moves the focus on
    // in a `nextTick` queued before this one, so the exit is judged once that has run.
    const from = event.target as Node
    void nextTick(() => {
      if (from.isConnected || !root.value?.contains(document.activeElement)) close()
    })
  }
}
