import { ref, type Ref } from 'vue'

// @core
/**
 * State plumbing of a `[popover]` element — the counterpart of
 * `styles/floating.css`, which carries the "positioning" half of the same
 * subject.
 *
 * Justified JS: the Popover API is imperative (`showPopover`/`hidePopover`) where
 * the rest of the DS is declarative, and it sets two traps a plain local boolean
 * does not cover —
 * - `hidePopover()` on an already-closed popover (or `showPopover()` on an
 *   already-open one) throws `InvalidStateError`: hence the idempotence guards;
 * - an `auto` popover closes WITHOUT being asked to (light dismiss): the state is
 *   read from the DOM, never guessed. `beforetoggle` is emitted SYNCHRONOUSLY
 *   during show/hidePopover() and on light dismiss; `toggle` is asynchronous in a
 *   browser, but it is the only one the jsdom stub emits (vitest.setup.ts) — so
 *   both must be listened to.
 *
 * Corollary: never set `shown` by hand (`shown.value = true` inside `show()`), or
 * a light dismiss desynchronizes the state and `hide()` becomes a silent no-op.
 */

// @fallback
// The `source` option of showPopover() is not in lib.dom yet (TS 5.9).
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

export function usePopover(el: Ref<HTMLElement | null>) {
  const shown = ref(false)

  /** To be wired to `@beforetoggle` AND `@toggle` on the popover element. */
  function syncShown(event: Event) {
    shown.value = (event as ToggleEvent).newState === 'open'
  }

  /**
   * `source` restores the invoker relationship (hence the implicit anchor and the
   * attachment to the stack) on PROGRAMMATIC opens — click invocation through
   * `popovertarget` sets it natively.
   */
  function show(source?: HTMLElement) {
    if (!shown.value)
      (el.value as PopoverWithSource | null)?.showPopover(source ? { source } : undefined)
  }

  function hide() {
    if (shown.value) el.value?.hidePopover()
  }

  return { shown, syncShown, show, hide }
}
