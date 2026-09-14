import { computed } from 'vue'
import type { Ref } from 'vue'

/**
 * The open state of a native `<details>`, shared by the design system's two consumers of one:
 * VAccordionItem and VSideNavigationItem. Bind `openAttr` to `:open`, `onToggle` to `@toggle`
 * and `onSummaryClick` to the `<summary>`'s `@click`.
 *
 * The element is the source of truth and the `v-model:open` is fed BY it. Left unbound (the
 * model's `null`), the value handed to `:open` never changes, so Vue never patches the element
 * back and the native toggling stays sovereign.
 *
 * `defaultOpen` is read ONCE, here, and never again: it is an initial state, so a prop changed
 * later must not close a section the reader has opened. Read inside the computed instead, a
 * parent re-rendering with another value would silently fold it.
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
    const value = (event.target as HTMLDetailsElement).open
    if (open.value !== value) open.value = value
  }

  // @a11y @core
  /*
   * A `<summary>` has no `disabled` attribute, so cancelling the click is the only way to stop
   * a disabled section from folding. The keyboard needs nothing: the component takes the
   * summary out of the tab order. Deliberately not `pointer-events: none`, which would also
   * remove the forbidden cursor telling the reader why nothing happens.
   */
  function onSummaryClick(event: MouseEvent) {
    if (options.disabled()) event.preventDefault()
  }

  return { openAttr, onToggle, onSummaryClick }
}
