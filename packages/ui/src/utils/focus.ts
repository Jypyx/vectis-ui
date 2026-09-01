// @a11y @fallback
/**
 * Whether this element is focused the way a keyboard user focuses things.
 *
 * A `focus` event does not carry the distinction: a mouse click and a Tab leave an element in
 * the same state. The browser already makes the judgement for its own focus rings and
 * publishes it as `:focus-visible`, so that is what gets asked. The `try` covers a selector
 * engine that throws on a pseudo-class it cannot parse; the keyboard is the careful answer
 * there, being the one that keeps a component reachable.
 *
 * TRAP for the tests — jsdom is NOT that environment. It parses `:focus-visible` happily and
 * answers `false` for everything, a genuinely focused element included, so the `catch` never
 * runs and every test silently takes the pointer branch. Stub `matches` on the element being
 * asked; what that locks is that the component ASKS and branches, never jsdom's answer.
 */
export function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  try {
    return target.matches(':focus-visible')
  } catch {
    return true
  }
}
