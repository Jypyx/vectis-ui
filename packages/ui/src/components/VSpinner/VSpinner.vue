<script setup lang="ts">
// @a11y
/**
 * Animate the ring in CSS; JavaScript resolves its accessible status label and normalizes
 * icon-compatible dimensions.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface SpinnerProps {
  /**
   * A size in pixels, as a number or a numeric string, understood exactly as VIcon's: it is the
   * BOX the spinner occupies, not the diameter of the ring, which is drawn slightly smaller
   * inside it.
   */
  size?: number | string
  /**
   * What screen readers announce while it turns. It falls back to the wording of the
   * design system dictionary, in the current language.
   */
  label?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: undefined,
  label: undefined,
})

const m = useMessages()
const resolvedLabel = computed(() => props.label ?? m.value.common.loading)
</script>

<template>
  <span
    class="v-spinner"
    :style="px(size) !== undefined ? { '--spinner-size': px(size) } : undefined"
    role="status"
  >
    <span class="v-spinner-circle" aria-hidden="true" />
    <span class="v-visually-hidden">{{ resolvedLabel }}</span>
  </span>
</template>

<style>
@layer vectis.components {
  .v-spinner {
    /* Draw at five sixths of the icon box to match the Material Symbols spinner's visible size. */
    --spinner-size: 1em;
    --spinner-ring: calc(var(--spinner-size) * 5 / 6);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: var(--spinner-size);
    height: var(--spinner-size);
  }

  .v-spinner-circle {
    width: var(--spinner-ring);
    height: var(--spinner-ring);
    /*
     * The stroke is a tenth of the ring's diameter, the same source again: the glyph's outer
     * radius is 400 and its inner one 320, so its stroke is 80 of those 800. It stays in
     * proportion at every size, with a one-pixel floor below which the ring would disappear; a
     * floor that only bites under a 12px box, which no size of the design system reaches.
     */
    border: max(1px, calc(var(--spinner-ring) / 10)) solid
      color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--vectis-radius-pill);
    animation: v-spinner-spin var(--vectis-duration-1000) linear infinite;
  }

  /* Written here and not shared with VProgressCircular's identical turn: in the core sheet
     it cost every consumer the bytes, and the two copies only meet in an application that
     loads both components. The name carries the component, since keyframe names are global. */
  @keyframes v-spinner-spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-spinner-circle {
      animation-duration: var(--vectis-duration-3000);
    }
  }

  /*
   * The track is drawn in GrayText and the moving quarter keeps the forced text colour, which
   * `currentcolor` still reads here since only the circle opts out of the forcing.
   */
  @media (forced-colors: active) {
    .v-spinner-circle {
      forced-color-adjust: none;
      border-color: GrayText;
      border-block-start-color: currentcolor;
    }
  }
}
</style>
