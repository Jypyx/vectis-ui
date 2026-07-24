import type { Ref } from 'vue'

// @a11y
/**
 * Closes something as soon as the focus leaves the component — its floating panel
 * included.
 *
 * That last part is what makes this so short. A panel painted above the whole page is
 * still, in the document, a descendant of the component that owns it, so asking whether
 * the focus went somewhere inside the component is enough; nothing has to be watched at
 * the level of the page.
 *
 * The focus going nowhere in particular — out of the window, or back to the page body —
 * counts as leaving too, and closes.
 *
 * This exists because a panel the browser does not dismiss on its own has to be closed
 * by hand. The self-dismissing kind, the menu's, needs none of it.
 */
export function useFocusoutDismiss(
  root: Ref<HTMLElement | null>,
  close: () => void,
): (event: FocusEvent) => void {
  return (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || !root.value?.contains(next)) close()
  }
}
