/**
 * Telling a keyboard focus apart from a pointer one.
 *
 * The distinction is needed because `focus` alone does not carry it: an element focused by a
 * mouse click and one reached with the Tab key are in exactly the same state, and a component
 * reading a bare focus flag treats a passing click as a reader settling in. The browser already
 * makes that judgement for its own focus rings, and `:focus-visible` is where it publishes it —
 * a pointer click on a button does not match it, a Tab does.
 */

// @a11y @fallback
/**
 * Whether this element is focused in the way a keyboard user focuses things.
 *
 * The `try` is for a selector engine that does not know the pseudo-class, and throws on one it
 * cannot parse rather than answering false. Every caller treats the keyboard as the careful
 * answer — it is the one that keeps a component reachable — so that is what an environment
 * unable to be asked returns.
 *
 * TRAP for the tests — jsdom is NOT that environment. It parses `:focus-visible` happily and
 * answers `false` for everything, a genuinely focused element included, so the `catch` never
 * runs there and every test silently takes the pointer branch. A test that means to exercise
 * the keyboard one has to stub `matches` on the element being asked; what it then locks is
 * that the component ASKS and branches, never what jsdom would have answered.
 */
export function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  try {
    return target.matches(':focus-visible')
  } catch {
    return true
  }
}
