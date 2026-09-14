// @a11y
/**
 * An IDREF list — the value of `aria-describedby` or `aria-labelledby` — assembled from
 * references that may each be absent. The empty ones are dropped by TRUTHINESS, so an empty
 * string contributes nothing, and a list left with no reference at all is `undefined`, which
 * removes the attribute instead of writing an empty one.
 *
 * A module of its own rather than a line in `text.ts`: every field loads it, and none of them
 * should pay for the text helpers to get it.
 */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined
}
