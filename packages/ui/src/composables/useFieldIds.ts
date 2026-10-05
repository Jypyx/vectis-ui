// @a11y @ssr
/**
 * Use hydration-stable IDs and append error/hint/counter references to consumer
 * aria-describedby rather than replacing it. The error comes first so that it is read first.
 */

import { computed, useId, type ComputedRef } from 'vue'

import { joinIds } from '../utils/ids'

export function useFieldIds(
  attrs: Record<string, unknown>,
  hasHint: () => boolean,
  hasCounter: () => boolean = () => false,
  hasError: () => boolean = () => false,
): {
  fieldId: ComputedRef<string>
  hintId: string
  counterId: string
  errorId: string
  describedBy: ComputedRef<string | undefined>
} {
  const uid = useId()
  const hintId = useId()
  const counterId = useId()
  const errorId = useId()

  return {
    fieldId: computed(() => (attrs.id as string | undefined) ?? uid),
    hintId,
    counterId,
    errorId,
    describedBy: computed(() =>
      joinIds(
        attrs['aria-describedby'] as string | undefined,
        hasError() && errorId,
        hasHint() && hintId,
        hasCounter() && counterId,
      ),
    ),
  }
}
