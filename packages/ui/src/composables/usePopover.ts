// @core
/**
 * The state plumbing of a `[popover]`: whether it is open, and how to open or close it.
 * The JS half of `styles/floating.css`, which places the panel.
 *
 * The Popover API is imperative where the rest of the library is declarative, and it sets
 * three traps a plain boolean would fall into. Closing an already-closed panel throws, hence
 * the idempotence guards. Opening one while the browser is busy with another popover throws
 * as well, hence the retry on `show`. And an `auto` panel dismisses itself on a click outside
 * or on Escape, so the state is READ from the DOM: wire `syncShown` to both `beforetoggle`
 * and `toggle`, the first being the only one that catches light dismiss in time and the
 * second the only one the jsdom stub emits.
 *
 * TRAP — never assign `shown` by hand. A panel the browser dismissed would then still read
 * as open, and the guard would swallow the next request to close it.
 */

import { ref, type Ref } from 'vue'

// @fallback
// The option below is newer than the type definitions shipped with TypeScript, so the
// element is described locally rather than being cast about at each call site.
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

export function usePopover(el: Ref<HTMLElement | null>) {
  const shown = ref(false)

  /**
   * Reads the state back off the panel. Bind it to both `@beforetoggle` and `@toggle`, and
   * on the popover element itself: ToggleEvents do not bubble.
   */
  function syncShown(event: Event) {
    shown.value = (event as ToggleEvent).newState === 'open'
  }

  /**
   * Opens the panel.
   *
   * TRAP — opening from code rather than from a click must name the invoker as `source`.
   * That is what recreates the relationship a click would have: the implicit anchor and the
   * panel's place in the popover stack. Without it the panel has nothing to position
   * against and lands at the corner of the viewport.
   */
  function show(source?: HTMLElement) {
    if (!shown.value) attempt(source, true)
  }

  /*
   * TRAP — the browser REFUSES to open a popover while it is in the middle of another
   * popover operation, and it throws rather than queueing the request
   * ("Invalid to show a popover during another show operation").
   *
   * The case that reaches it is ordinary: closing a popover that holds the focus hands
   * that focus back to its invoker SYNCHRONOUSLY, inside the hide, and a component
   * listening for that focus opens a panel of its own from the handler — a tooltip on the
   * button a menu has just closed. Nothing in the calling code can see it coming.
   *
   * A microtask runs once the stack has unwound, hence after the operation the browser was
   * in, which is all it takes. A second refusal is left alone: the panel stays closed
   * rather than the page taking an uncaught error.
   */
  function attempt(source: HTMLElement | undefined, retry: boolean) {
    const panel = el.value as PopoverWithSource | null
    if (!panel || shown.value) return
    try {
      panel.showPopover(source ? { source } : undefined)
    } catch {
      if (retry) queueMicrotask(() => attempt(source, false))
    }
  }

  /** Closes the panel. */
  function hide() {
    if (shown.value) el.value?.hidePopover()
  }

  return { shown, syncShown, show, hide }
}
