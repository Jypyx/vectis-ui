// @core
/**
 * Read open state from the element and update the model from native toggle events. Assigning a
 * separate shown flag would miss browser dismissal.
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
   * Opening from code rather than from a click must name the invoker as `source`. That is what
   * recreates the relationship a click would have: the implicit anchor and the panel's place in
   * the popover stack.
   */
  function show(source?: HTMLElement) {
    attempt(source, true)
  }

  /*
   * Retry after the current popover operation: synchronous focus restoration can request
   * another popover while the browser is still hiding the first.
   */
  function attempt(source: HTMLElement | undefined, retry: boolean) {
    const panel = el.value as PopoverWithSource | null
    if (!panel || shown.value) return
    try {
      panel.showPopover(source ? { source } : undefined)
    } catch {
      // A close asked for before the microtask runs must win: the retry checks that no `hide`
      // came in between, or it would reopen a panel just closed.
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
 * The `value === shown()` guard is what keeps the two directions from chasing each other. A
 * panel the browser has just dismissed writes `false` into the model; without the guard that
 * write would come back here as a request to close a panel already closed.
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
