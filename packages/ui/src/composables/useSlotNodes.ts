import { computed, onBeforeUpdate, ref, useSlots, type ComputedRef, type VNode } from 'vue'

import { flattenSlot } from '../utils/vnode'

// @ssr @core
/**
 * The VNodes a slot renders, flattened by `flattenSlot`, for a component that has to KNOW
 * its children (how many, which kind) rather than merely render them. Reading the slot
 * instead of keeping a registry the children feed at mount is what keeps the server and
 * the client in agreement.
 *
 * TRAP: a bare `computed(() => flattenSlot(slots.default?.()))` goes stale. `slots` is not
 * reactive: the computed only tracks what the slot READS while it runs, so a parent handing
 * down a NEW slot function leaves it cached. That is the case of a render function whose
 * slot captures a local, of a `v-for` whose array is replaced wholesale, and of a `v-if`
 * between two slot templates: the old children stay on screen with no warning. The tick
 * below is bumped before every re-render of the component, which is exactly when a new slot
 * can have arrived, so the read is redone then; computeds derived from it keep their cache
 * as long as their own value does not change. Bumping it there schedules nothing: Vue does
 * not let an update re-queue itself while it runs.
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
