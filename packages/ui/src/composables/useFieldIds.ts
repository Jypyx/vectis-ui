// @a11y @ssr
/**
 * Use hydration-stable IDs and append hint/counter references to consumer aria-describedby
 * rather than replacing it.
 */

import { computed, useId, type ComputedRef } from 'vue'

import { joinIds } from '../utils/ids'

export function useFieldIds(
  attrs: Record<string, unknown>,
  hasHint: () => boolean,
  hasCounter: () => boolean = () => false,
): {
  fieldId: ComputedRef<string>
  hintId: string
  counterId: string
  describedBy: ComputedRef<string | undefined>
} {
  const uid = useId()
  const hintId = useId()
  const counterId = useId()

  return {
    fieldId: computed(() => (attrs.id as string | undefined) ?? uid),
    hintId,
    counterId,
    describedBy: computed(() =>
      joinIds(
        attrs['aria-describedby'] as string | undefined,
        hasHint() && hintId,
        hasCounter() && counterId,
      ),
    ),
  }
}
