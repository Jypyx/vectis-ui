// @a11y @ssr
/**
 * The ids tying a wrapped field to its label, its hint and its counter — VInput and VTextarea, and the hint
 * of VCheckbox, VRadio and VSwitch.
 *
 * A consumer `id` WINS over the generated one, or a label they wrote outside the component
 * would point at nothing. `aria-describedby` is a space-separated LIST, so the component's
 * hint is APPENDED to whatever the consumer already pointed at rather than replacing it,
 * and the counter after it: a screen reader then reads "12/80" out on focus, where it would
 * otherwise only ever be seen.
 *
 * Ids come from `useId()` rather than a counter of our own, which is what keeps them
 * identical across the server render and hydration.
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
