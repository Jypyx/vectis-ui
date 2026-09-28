// @a11y
/**
 * Omit empty ID references and return undefined for an empty list so ARIA attributes are
 * removed rather than left blank.
 */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined
}
