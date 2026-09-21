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

import { onMounted, ref, watch, type Ref } from 'vue'

// @fallback
// The option below is newer than the type definitions shipped with TypeScript, so the
// element is described locally rather than being cast about at each call site.
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

export function usePopover(el: Readonly<Ref<HTMLElement | null>>) {
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
    attempt(source, true)
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
      // TRAP — a close asked for before the microtask runs must win: the retry checks
      // that no `hide` came in between, or it would reopen a panel just closed.
      const asked = generation
      if (retry) queueMicrotask(() => asked === generation && attempt(source, false))
    }
  }

  /** Bumped by every close, so a retry queued before it knows it was overtaken. */
  let generation = 0

  /** Closes the panel. */
  function hide() {
    generation += 1
    if (shown.value) el.value?.hidePopover()
  }

  return { shown, syncShown, show, hide }
}

// @core
/**
 * The model half of a popover's `v-model:open`, for a component that publishes its open
 * state: a change to the model opens or closes the panel. The other half — writing the
 * DOM's state back into the model — stays with the component, in its own toggle handler,
 * because that is where it knows the state has settled.
 *
 * `shown` is a getter so that the state may live in a child: VPopover reads its own
 * `usePopover`, VMenu reads the one VMenuPanel exposes.
 *
 * TRAP — the `value === shown()` guard is what keeps the two directions from chasing each
 * other. A panel the browser has just dismissed writes `false` into the model; without the
 * guard that write would come back here as a request to close a panel already closed.
 */
export function usePopoverModel(
  open: Ref<boolean>,
  shown: () => boolean,
  show: () => void,
  hide: () => void,
) {
  watch(open, (value) => {
    if (value === shown()) return
    if (value) show()
    else hide()
  })

  // @ssr
  // A watcher does not run during the server render, so a panel asked to be open
  // from the start would never be told to open. Replaying the initial state on mount is
  // what covers that case.
  onMounted(() => {
    if (open.value) show()
  })
}
