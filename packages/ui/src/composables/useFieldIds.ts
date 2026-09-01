// @a11y @ssr
/**
 * The ids tying a wrapped field to its label and its hint — VInput and VTextarea.
 *
 * A consumer `id` WINS over the generated one, or a label they wrote outside the component
 * would point at nothing. `aria-describedby` is a space-separated LIST, so the component's
 * hint is APPENDED to whatever the consumer already pointed at rather than replacing it.
 *
 * Ids come from `useId()` rather than a counter of our own, which is what keeps them
 * identical across the server render and hydration.
 */

import { computed, useId, type ComputedRef } from 'vue'

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
