<script setup lang="ts">
// @ssr @core
/**
 * Count avatars through slot VNodes for SSR-consistent overflow; useSlotNodes keeps that count
 * reactive when the parent replaces its slot.
 */

import { computed, provide } from 'vue'
import type { StyleValue } from 'vue'

import VAvatar from './VAvatar.vue'
import type { AvatarSize } from './VAvatar.vue'
import { AVATAR_DEFAULT_SIZE, avatarGroupKey } from './context'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useSlotNodes } from '../../composables/useSlotNodes'

/** What the `#overflow` slot receives. */
export interface AvatarGroupOverflowSlotProps {
  /** How many avatars are hidden beyond `max`. */
  count: number
}

interface AvatarGroupProps {
  /**
   * How many avatars to show before the remaining ones are summed up as a single
   * "+X" disc. Left out, or set to 0, every avatar is shown.
   */
  max?: number
  /**
   * The size given to the avatars inside the group. An avatar that sets a `size`
   * of its own keeps it.
   */
  size?: AvatarSize
  /**
   * Applies the reduced density to every avatar inside. Unlike `size` it is cumulative: an
   * avatar cannot opt back out of a compact group.
   */
  compact?: boolean
  /**
   * The colour of the ring drawn around each disc. It defaults to the page background, which
   * makes the ring read as a gap between two avatars.
   */
  ringColor?: string
  /**
   * The accessible name of the group, e.g. "Project members". A row of faces does not say on
   * its own who these people are. A consumer `aria-label` or `aria-labelledby` wins over it.
   */
  label?: string
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: undefined,
  compact: false,
  ringColor: undefined,
  label: undefined,
})

const ariaLabel = useAriaLabel(() => props.label)

defineSlots<{
  /** The VAvatars to stack. */
  default?(): unknown
  /**
   * Replaces the "+X" disc that stands for the avatars beyond `max`. It receives
   * `count`, the number of avatars being hidden.
   */
  overflow?(props: AvatarGroupOverflowSlotProps): unknown
}>()

provide(avatarGroupKey, {
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
})

const items = useSlotNodes()
// `max: 0` means "no limit", as documented, and so does a negative one: `slice(0, -1)` would
// drop the last avatar and sum it into a "+1" disc.
const visibleItems = computed(() =>
  props.max !== undefined && props.max > 0 ? items.value.slice(0, props.max) : items.value,
)
const overflowCount = computed(() => items.value.length - visibleItems.value.length)

// A functional component is the only way to render VNodes that have already been
// captured: <component :is> expects a component definition, not a vnode.
const VisibleAvatars = () => visibleItems.value

const rootStyle = computed<StyleValue>(() =>
  props.ringColor !== undefined ? { '--avatar-ring-color': props.ringColor } : undefined,
)

// The group carries v-control so that --control-height is defined at ITS level, which keeps the
// overlap computable even when a child is wrapped; a VTooltip, for instance, inserts a <span>
// between the group and the VAvatar. An avatar given a size of its own redefines
// --control-height on itself, so its own overlap follows that size rather than the group's.
const resolvedGroupSize = computed<AvatarSize>(() => props.size ?? AVATAR_DEFAULT_SIZE)
</script>

<template>
  <div
    class="v-avatar-group v-control"
    role="group"
    :aria-label="ariaLabel"
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
    /* The separation ring, declared here so that every child .v-avatar inherits it. */
    --avatar-ring-color: var(--vectis-color-surface);
    display: inline-flex;
    align-items: center;
  }

  /*
   * Take overlap height from the group so wrappers and differently sized avatars share one row
   * contract.
   */
  .v-avatar-group > * + * {
    margin-inline-start: calc(var(--control-height) * -0.3);
  }

  /* On hover, or as soon as something inside it takes focus, a disc rises above its
     neighbours so it is seen whole rather than clipped by the next one. */
  .v-avatar-group > *:hover,
  .v-avatar-group > *:focus-within {
    z-index: 1;
  }
}
</style>
