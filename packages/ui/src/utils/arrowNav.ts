/**
 * Arrow-key navigation within a row/column of sibling elements.
 *
 * Justified JS: no native primitive moves focus between sibling buttons. The
 * contract is the same everywhere in the DS — the arrows and Home/End only ever
 * **MOVE focus**, never activate: activating on focus would trigger an
 * unintended navigation or value toggle. A component that wants activation on
 * focus (VTabs with `activation: 'automatic'`) sets it itself, in its own
 * `@focus`.
 *
 * Single incarnation for VPagination, VTabs, VToggle and VMenu.
 */

/**
 * The navigable elements of a container: the selector excludes disabled ones,
 * and the `display` filter drops those hidden by a container query
 * (VPagination) or by the consumer (VTabs, VToggle) — a hidden element must not
 * take focus.
 */
export function navigableItems(container: HTMLElement, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
}

/**
 * Handles ArrowUp/Down/Left/Right + Home/End over `items` and moves focus.
 * Returns `true` if the key was consumed (`preventDefault` already applied),
 * `false` otherwise — the caller can then let the event through.
 *
 * - Modulo wrap at the ends; with no current focus in the list, it starts from
 *   the first element whatever the direction.
 * - The INLINE-axis arrows are physical, hence inverted in RTL; the block-axis
 *   ones are not (the block axis does not flip).
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

  // `forward` is only read by the arrow branch, and the inline axis is the only one
  // that needs the direction: a lazy getter keeps Home/End off the style recalc that
  // `getComputedStyle` forces.
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
