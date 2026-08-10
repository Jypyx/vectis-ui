import type { Ref } from 'vue'

// @a11y
/**
 * Root `@focusout` handler: closes when focus leaves the component, floating
 * panel included — a popover is a DOM descendant of the root even when painted
 * in the top layer, so `contains` is enough and there is nothing to observe at
 * document level.
 *
 * A null `relatedTarget` means focus is leaving the window (or going to the
 * body): that is also an exit, so it closes.
 *
 * Needed because a `manual` popover has no light dismiss; `auto` panels (VMenu)
 * do not need it, the platform handles it.
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
