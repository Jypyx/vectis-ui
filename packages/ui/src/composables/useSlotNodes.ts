import { computed, onBeforeUpdate, ref, useSlots, type ComputedRef, type VNode } from 'vue'

import { flattenSlot } from '../utils/vnode'

// @ssr @core
/**
 * A bare `computed(() => flattenSlot(slots.default?.()))` goes stale. `slots` is not reactive:
 * the computed only tracks what the slot READS while it runs, so a parent handing down a NEW
 * slot function leaves it cached.
 */
export function useSlotNodes(name = 'default'): ComputedRef<VNode[]> {
  const slots = useSlots()
  const tick = ref(0)
  onBeforeUpdate(() => {
    tick.value++
  })
  return computed(() => {
    void tick.value
    return flattenSlot(slots[name]?.())
  })
}
