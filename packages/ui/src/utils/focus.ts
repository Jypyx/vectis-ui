// @a11y @fallback
/**
 * jsdom parses focus-visible but always reports false; tests must stub visibility rather than
 * rely on the unsupported-selector fallback.
 */
export function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  try {
    return target.matches(':focus-visible')
  } catch {
    return true
  }
}
