/**
 * Row size and compact override control shape; disabled is cumulative so no child can
 * reactivate a disabled row.
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
