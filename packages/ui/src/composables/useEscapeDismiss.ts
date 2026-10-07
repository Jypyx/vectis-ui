import { onBeforeUnmount } from 'vue'

// @keyboard @a11y
/**
 * Escape dismisses an overlay opened by hover or focus from anywhere on the page (WCAG 1.4.13),
 * for a magnifier user whose view it may be covering. Such an overlay rarely holds the focus, so
 * the key is heard on the document while it shows, and it is spent there: inside a VDialog it
 * would otherwise also be the dialog's close request. Returns the switch to call as the overlay
 * opens and closes; the listener goes with the component.
 */
export function useEscapeDismiss(onEscape: () => void): (active: boolean) => void {
  let listening = false

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    event.preventDefault()
    onEscape()
  }

  function listen(active: boolean) {
    if (active === listening) return
    listening = active
    if (active) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  }

  onBeforeUnmount(() => listen(false))
  return listen
}
