// @a11y
/**
 * A `@focusout` handler closing the component when focus leaves it, panel included.
 *
 * A popover stays a DOM descendant of its owner even while painted in the top layer, so
 * `contains` is the whole test and nothing has to be watched at document level. A null
 * `relatedTarget` — focus gone to the body, or out of the window — counts as leaving.
 *
 * Only `manual` popovers need this. VMenu's `auto` panel is dismissed by the browser.
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
