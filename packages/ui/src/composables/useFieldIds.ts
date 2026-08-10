import { computed, useId, type ComputedRef } from 'vue'

// @a11y @ssr
/**
 * Identifiers of a wrapped field (VInput, VTextarea): label/`for` association,
 * hint id, and `aria-describedby` aggregation.
 *
 * Two subtleties:
 * - an `id` supplied by the consumer WINS over the internal `useId()`, otherwise
 *   their external `<label for>` would point at nothing;
 * - `aria-describedby` is a LIST of IDREFs: the internal hint is added to the
 *   consumer's rather than overwriting it.
 *
 * `useId()` (and not a counter): SSR-safe, identical on server and client.
 */
export function useFieldIds(
  attrs: Record<string, unknown>,
  hasHint: () => boolean,
): { fieldId: ComputedRef<string>; hintId: string; describedBy: ComputedRef<string | undefined> } {
  const uid = useId()
  const hintId = useId()

  return {
    fieldId: computed(() => (attrs.id as string | undefined) ?? uid),
    hintId,
    describedBy: computed(() => {
      const ids = [attrs['aria-describedby'] as string | undefined, hasHint() ? hintId : undefined]
      return ids.filter(Boolean).join(' ') || undefined
    }),
  }
}
