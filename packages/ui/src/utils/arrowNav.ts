// @keyboard @a11y
/**
 * Arrow-key navigation over a row or column of controls, in one place: VPagination, VTabs,
 * VToggle, VMenuPanel and VSideNavigation all use it.
 */
import { isRtl } from './direction'

/** The elements the arrows may land on, discovered from the DOM rather than a registry. */
export function navigableItems(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
}

/** Moves focus for the arrows and Home/End, and reports whether it took the key. */
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
