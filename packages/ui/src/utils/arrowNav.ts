/**
 * Moving through a row or a column of neighbouring controls with the arrow keys.
 *
 * There is code here because the browser offers nothing that walks the focus from one
 * button to the next: the Tab key steps out of the group entirely, and a group of tabs, a
 * set of pages or a menu is expected to be crossed with the arrows.
 *
 * The rule is the same everywhere in the design system, and it is worth stating plainly:
 * the arrow keys and Home and End MOVE the focus and never act on what they land on.
 * Acting on arrival would navigate somewhere the reader did not ask to go, or turn a
 * value on merely because they passed over it. A component that genuinely wants the
 * arrival to select — a row of tabs can be set up that way — arranges that itself.
 *
 * This is the single place that behaviour is written: the pages, the tabs, the toggle
 * group and the menu all use it.
 */

// @keyboard @a11y
/**
 * The elements inside a container that the arrows may land on. The selector is the
 * caller's, and it is the one that leaves out anything disabled.
 *
 * Anything hidden is dropped here, and it has to be: the pages hide their neighbours as
 * the bar gets narrower, and a consumer may hide a tab or a toggle outright. An element
 * nobody can see must not be given the focus.
 */
export function navigableItems(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
}

// @keyboard @a11y
/**
 * Handles the four arrows and the Home and End keys over a list of elements, and moves
 * the focus.
 *
 * It reports whether it took the key. When it did, the browser's own reaction has already
 * been suppressed; when it did not, the caller is free to do something else with it.
 *
 * The ends WRAP: past the last element the focus comes back to the first. When nothing in
 * the list has the focus yet, any arrow starts at the beginning.
 *
 * The left and right arrows point at a physical side of the screen, so in a language
 * written right to left they are swapped: pressing right must move towards the NEXT item,
 * which is then to the left. Up and down need no such treatment, since no language
 * reverses them.
 */
export function arrowNavigate(
  event: KeyboardEvent,
  container: HTMLElement,
  items: HTMLElement[],
  options: { vertical?: boolean } = {},
): boolean {
  const vertical = options.vertical ?? false
  const keys = vertical
    ? ['ArrowDown', 'ArrowUp', 'Home', 'End']
    : ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return false
  if (items.length === 0) return false
  event.preventDefault()

  // Only the arrow branch asks which way is forward, and only the horizontal axis needs
  // the writing direction to answer. Keeping it a function rather than a value is what
  // spares Home and End the style recalculation that reading the direction forces.
  const forward = () =>
    vertical
      ? event.key === 'ArrowDown'
      : (event.key === 'ArrowRight') !== (getComputedStyle(container).direction === 'rtl')
  const current = items.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : current === -1
          ? 0
          : (current + (forward() ? 1 : -1) + items.length) % items.length
  items[next]?.focus()
  return true
}
