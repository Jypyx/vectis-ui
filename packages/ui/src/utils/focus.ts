// @a11y
/** Use the browser's focus-visible heuristic to distinguish keyboard focus. */
export function isKeyboardFocus(target: EventTarget | null): boolean {
  return target instanceof Element && target.matches(':focus-visible')
}
