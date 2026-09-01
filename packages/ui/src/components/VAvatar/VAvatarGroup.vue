<script setup lang="ts">
// @ssr @core — the number of avatars is read from the slot's VNODES through
// `flattenSlot`, never from a registry the children would fill at mount: such a
// registry is empty during the server render and full on the client, which is a
// hydration mismatch.
/**
 * Several VAvatars stacked into an overlapping row — a team, the participants in a
 * conversation. Each disc bites into the one before it and, coming later in the document, is
 * painted over it: the browser's paint order does the work, with no positioning code. A ring
 * in `--avatar-ring-color` keeps the overlapping edges distinct.
 *
 * Two things need JS. Counting the avatars given and keeping only the first few, so the rest
 * can be summed up as one "+N" disc, is expressible in neither HTML nor CSS — and the count
 * comes from the slot's VNODES, never a registry, which would render 0 on the server and N
 * in the browser. And the group's size and density reach the avatars through provide/inject.
 */

import { computed, provide, useSlots } from 'vue'
import type { StyleValue } from 'vue'

import VAvatar from './VAvatar.vue'
import type { AvatarSize } from './VAvatar.vue'
import { avatarGroupKey } from './context'

import { flattenSlot } from '../../utils/vnode'

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
  /** Applies the reduced density to the avatars inside, on the same terms as `size`. */
  compact?: boolean
  /**
   * The colour of the ring drawn around each disc. It defaults to the page
   * background, which is what makes the ring read as a gap between two avatars.
   */
  ringColor?: string
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: undefined,
  compact: false,
  ringColor: undefined,
})

defineSlots<{
  /** The VAvatars to stack. */
  default?(): unknown
  /**
   * Replaces the "+X" disc that stands for the avatars beyond `max`. It receives
   * `count`, the number of avatars being hidden.
   */
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

// A functional component is the only way to render VNodes that have already been
// captured: <component :is> expects a component definition, not a vnode.
const VisibleAvatars = () => visibleItems.value

const rootStyle = computed<StyleValue>(() =>
  props.ringColor !== undefined ? { '--avatar-ring-color': props.ringColor } : undefined,
)

// The group carries v-control so that --control-height is defined at ITS level,
// which keeps the overlap computable even when a child is wrapped — a VTooltip, for
// instance, inserts a <span> between the group and the VAvatar. An avatar given a
// size of its own redefines --control-height on itself, so its own overlap follows
// that size rather than the group's.
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
    /* The separation ring, declared here so that every child .v-avatar inherits it. */
    --avatar-ring-color: var(--vectis-color-surface);
    display: inline-flex;
    align-items: center;
  }

  /* The overlap itself: each disc bites into the previous one by a fraction of its
     own height, and the DOM order is what makes the following one paint over it.
     The selector deliberately targets the direct child whatever it is — a bare
     VAvatar as well as a VTooltip wrapper — which is why --control-height has to
     come from the group; an avatar carrying its own size overrides it on itself.
     The ratio is unitless so it scales with whichever height applies. */
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
