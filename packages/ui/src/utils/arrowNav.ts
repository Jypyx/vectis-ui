// @keyboard @a11y — module-wide: the browser walks focus out of a group with Tab, never
// from one control to the next, which is what the arrows are expected to do.
/**
 * Arrow-key navigation over a row or column of controls, in one place: VPagination, VTabs,
 * VToggle, VMenuPanel and VSideNavigation all use it.
 *
 * CONTRACT — the arrows and Home/End MOVE focus and never activate what they land on.
 * Activating on arrival would navigate somewhere the reader did not ask to go, or select a
 * value merely passed over. A component that wants selection on focus (VTabs'
 * `activation: 'automatic'`) arranges it in its own `@focus`.
 */
import { isRtl } from './direction'

/**
 * The elements the arrows may land on, discovered from the DOM rather than a registry. The
 * selector is the caller's, and it is what excludes anything disabled.
 *
 * `display: none` is filtered here because it has to be: VPagination hides its neighbours
 * through container queries as the bar narrows, and a consumer may hide a tab outright.
 * Focus must not land on an element nobody can see. The read costs a style recalculation
 * per element, which is why `arrowNavigate` asks for the list only once it knows the key is
 * one it handles.
 */
export function navigableItems(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
}

/**
 * Moves focus for the arrows and Home/End, and reports whether it took the key —
 * `preventDefault` is applied only when it did, leaving the caller free otherwise.
 *
 * The ends wrap. With nothing in the list focused, any arrow starts at the beginning.
 * Left and Right name a physical side, so RTL swaps them: Right must reach the NEXT item,
 * which is then on the left. The block axis needs no such treatment, no language
 * reversing it.
 *
 * A key held with Alt, Ctrl or Meta is never taken: those are the browser's and the system's
 * shortcuts (Alt+Left goes back a page), and cancelling one to move a focus would break it.
 *
 * `items` is a FUNCTION, called only once the key is known to be one of the four. A keydown
 * handler on a container sees every key typed inside it (Tab, Enter, letters), and collecting
 * the list costs a query plus, for most callers, one style read per element.
 */
export function arrowNavigate(
  event: KeyboardEvent,
  container: HTMLElement,
  items: () => HTMLElement[],
  options: { vertical?: boolean } = {},
): boolean {
  const vertical = options.vertical ?? false
  const keys = vertical
    ? ['ArrowDown', 'ArrowUp', 'Home', 'End']
    : ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (event.altKey || event.ctrlKey || event.metaKey || !keys.includes(event.key)) return false
  const list = items()
  if (list.length === 0) return false
  event.preventDefault()

  // A function, not a value: only the arrow branch asks, so Home and End are spared the
  // style recalculation that reading the direction forces.
  const forward = () =>
    vertical ? event.key === 'ArrowDown' : (event.key === 'ArrowRight') !== isRtl(container)
  const current = list.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.length - 1
        : current === -1
          ? 0
          : (current + (forward() ? 1 : -1) + list.length) % list.length
  list[next]?.focus()
  return true
}
