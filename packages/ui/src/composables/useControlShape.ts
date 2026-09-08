/**
 * The arbitration between a control and the row it sits in, resolved once.
 *
 * Six components read a group context — VButton from a VButtonGroup, and the five fields
 * from a VInputGroup — and each of them wrote the same three computeds by hand. Two of the
 * three use `??` and the third uses `||`, and that asymmetry is the whole rule: `size` and
 * `compact` are the SHAPE of the control, which belongs to the row, while `disabled` is
 * CUMULATIVE, so a row switched off cannot have one of its segments opt back in. Written out
 * six times, one of the six was always going to end up with the wrong operator.
 *
 * It takes the injected context rather than the key so a component keeps its own typing: the
 * two contexts carry different sizes, and neither is `unknown` on the other side.
 */
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

/** The three members every group context shares, whatever else it carries. */
interface ShapeContext<S> {
  readonly size?: S
  readonly compact?: boolean
  readonly disabled?: boolean
}

interface ShapeProps<S> {
  readonly size: S
  readonly compact: boolean
  readonly disabled: boolean
}

export interface ResolvedShape<S> {
  /** The height, the row's if it named one. */
  size: ComputedRef<S>
  /** The reduced density, the row's if it named one. */
  compact: ComputedRef<boolean>
  /** Unusable as soon as EITHER the row or the control says so. */
  disabled: ComputedRef<boolean>
}

export function useControlShape<S>(
  props: ShapeProps<S>,
  group: ShapeContext<S> | null,
): ResolvedShape<S> {
  return {
    size: computed(() => group?.size ?? props.size),
    compact: computed(() => group?.compact ?? props.compact),
    disabled: computed(() => group?.disabled || props.disabled),
  }
}
