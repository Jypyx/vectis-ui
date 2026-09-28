import { computed, nextTick } from 'vue'
import type { Ref } from 'vue'

/**
 * The open state of a native `<details>`, shared by the design system's two consumers of one:
 * VAccordionItem and VSideNavigationItem. Read inside the computed instead, a parent
 * re-rendering with another value would silently fold it.
 */
export function useDetailsOpen(
  open: Ref<boolean | null>,
  options: { defaultOpen: () => boolean; disabled: () => boolean },
) {
  const initial = options.defaultOpen()
  const openAttr = computed(() => (open.value ?? initial) || undefined)

  // @core
  // The toggle event does not bubble, which is convenient: listening on the element itself
  // cannot pick up a nested `<details>` opening inside it.
  function onToggle(event: Event) {
    const element = event.target as HTMLDetailsElement
    const value = element.open
    if (open.value === value) return
    open.value = value
    /*
     * A controlled model may refuse the change (`:open="false"` and no handler, or one that
     * says no). Nothing then moves in the props, so Vue has nothing to patch, and the element
     * would stay open under a model that says closed.
     */
    void nextTick(() => {
      if (open.value !== null && element.open !== open.value) element.open = open.value
    })
  }

  // @a11y @core
  /*
   * A `<summary>` has no `disabled` attribute, so cancelling the click is the only way to stop
   * a disabled section from folding. The keyboard needs nothing: the component takes the
   * summary out of the tab order.
   */
  function onSummaryClick(event: MouseEvent) {
    if (options.disabled()) event.preventDefault()
  }

  return { openAttr, onToggle, onSummaryClick }
}
