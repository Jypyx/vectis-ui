<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import type { StyleValue } from 'vue'

import VAvatar from './VAvatar.vue'
import type { AvatarSize } from './VAvatar.vue'
import { avatarGroupKey } from './context'

import { flattenSlot } from '../../utils/vnode'

/**
 * Stacks VAvatars (the right-hand one paints over the left-hand one, through a
 * negative overlap + the natural DOM paint order — no positioning JS). The
 * `--avatar-ring-color` ring visually separates the discs.
 *
 * JS justified: counting/truncating the slot's children (impossible in HTML/CSS)
 * for the "+X" aggregate; the size/compact propagation goes through provide.
 */
interface AvatarGroupProps {
  /** Maximum number of Avatars shown before the "+X" aggregate (0/absent = all). */
  max?: number
  /** Size propagated to the child Avatars (unless the child sets an explicit `size`). */
  size?: AvatarSize
  /** Compact propagated to the child Avatars. */
  compact?: boolean
  /** Colour of the separation ring (default: the page background). */
  ringColor?: string
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: undefined,
  compact: false,
  ringColor: undefined,
})

defineSlots<{
  /** The Avatars to stack. */
  default?(): unknown
  /** Aggregate of the hidden Avatars; `count` = the remaining number. */
  overflow?(props: { count: number }): unknown
}>()

provide(avatarGroupKey, {
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
})

const slots = useSlots()

const items = computed(() => flattenSlot(slots.default?.()))
const visibleItems = computed(() =>
  props.max != null ? items.value.slice(0, props.max) : items.value,
)
const overflowCount = computed(() => items.value.length - visibleItems.value.length)

// A functional component: renders the already-captured VNodes (impossible through
// <component :is>, which expects a definition, not a vnode).
const VisibleAvatars = () => visibleItems.value

const rootStyle = computed<StyleValue>(() =>
  props.ringColor !== undefined ? { '--avatar-ring-color': props.ringColor } : undefined,
)

// The group carries v-control so --control-height is defined at ITS level: the
// overlap stays computable even when a child is wrapped (e.g. a VTooltip puts a
// <span> between the group and the VAvatar). A VAvatar with a size of its own
// redefines --control-height on itself → its overlap follows its size.
const resolvedGroupSize = computed<AvatarSize>(() => props.size ?? 'md')
</script>

<template>
  <div
    class="v-avatar-group v-control"
    role="group"
    :style="rootStyle"
    :data-size="resolvedGroupSize"
    :data-compact="compact ? '' : undefined"
  >
    <component :is="VisibleAvatars" />
    <slot v-if="overflowCount > 0" name="overflow" :count="overflowCount">
      <VAvatar>+{{ overflowCount }}</VAvatar>
    </slot>
  </div>
</template>

<style>
@layer vectis.components {
  .v-avatar-group {
    /* Separation ring, inherited by every child .v-avatar */
    --avatar-ring-color: var(--vectis-color-surface);
    display: inline-flex;
    align-items: center;
  }

  /* Overlap: each disc bites into the previous one; the DOM order makes the next
     (right-hand) one paint over it. Targets the direct child whatever it is (a bare
     VAvatar OR a VTooltip wrapper) → --control-height comes from the group, and a
     VAvatar with a size of its own overrides it on itself. A unitless ratio. */
  .v-avatar-group > * + * {
    margin-inline-start: calc(var(--control-height) * -0.3);
  }

  /* On hover/focus, the element rises above its neighbours. */
  .v-avatar-group > *:hover,
  .v-avatar-group > *:focus-within {
    z-index: 1;
  }
}
</style>
