import { computed, useId, type ComputedRef } from 'vue'

// @a11y @ssr
/**
 * The identifiers a wrapped field needs — the text input and the multi-line one. They
 * are what ties a label to its field and a field to the help text below it, so that
 * clicking the label focuses the field and a screen reader reads the hint out with it.
 *
 * Two points are worth knowing. An identifier the consumer supplies WINS over the one
 * generated here, or a label they wrote themselves outside the component would point at
 * nothing. And the link to the descriptive text is a LIST rather than a single value, so
 * the component's own hint is ADDED to whatever the consumer already pointed at instead
 * of replacing it.
 *
 * The generated identifiers come from Vue's own facility rather than a counter of our
 * own, which is what makes them identical in the page rendered on the server and in the
 * one the browser takes over.
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
