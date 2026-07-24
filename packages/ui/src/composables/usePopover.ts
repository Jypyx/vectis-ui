import { ref, type Ref } from 'vue'

// @core
/**
 * Everything needed to know whether a floating panel is open, and to open or close it.
 * It is the code half of a subject whose other half is `styles/floating.css`, which
 * handles where such a panel is placed.
 *
 * The browser's own support for these panels is imperative, where the rest of the design
 * system is declarative, and it sets two traps a plain local boolean would fall into.
 *
 * Asking to close a panel that is already closed — or to open one already open — throws.
 * Hence the guards, which make both calls safe to repeat.
 *
 * And a panel of the self-dismissing kind closes WITHOUT anyone asking, on a click outside
 * or on Escape. So the state is READ from the panel rather than guessed: it reports both
 * synchronously as it changes and again afterwards, and both have to be listened to — the
 * first is the only one that catches a dismissal in time, the second the only one the unit
 * tests' stub emits at all.
 *
 * TRAP — never assign that state by hand, tempting though it is inside the opening
 * function. A panel dismissed by the browser would then leave the state saying it is open,
 * and the next request to close it would be swallowed by the guard.
 */

// @fallback
// The option below is newer than the type definitions shipped with TypeScript, so the
// element is described locally rather than being cast about at each call site.
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

export function usePopover(el: Ref<HTMLElement | null>) {
  const shown = ref(false)

  /**
   * Reads the state from the panel itself. It must be wired to BOTH events the panel
   * emits, and on the panel element: these events do not travel up the tree.
   */
  function syncShown(event: Event) {
    shown.value = (event as ToggleEvent).newState === 'open'
  }

  /**
   * Opens the panel.
   *
   * TRAP — when the panel is opened from code rather than by a click, the element it
   * belongs to must be named as the SOURCE of that opening. That is what re-establishes
   * the relationship a click would have created: the panel's implicit anchor, and its
   * place in the stack of open panels. Without it the panel has nothing to position itself
   * against.
   */
  function show(source?: HTMLElement) {
    if (!shown.value)
      (el.value as PopoverWithSource | null)?.showPopover(source ? { source } : undefined)
  }

  /** Closes the panel. */
  function hide() {
    if (shown.value) el.value?.hidePopover()
  }

  return { shown, syncShown, show, hide }
}
