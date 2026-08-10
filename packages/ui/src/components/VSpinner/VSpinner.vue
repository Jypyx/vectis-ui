<script setup lang="ts">
// @a11y
/**
 * 100% CSS loading indicator. role="status" + a hidden label: announced by screen
 * readers with no visual noise.
 *
 * The label `computed` is the only JS: not behaviour (no event, no lifecycle, no
 * DOM), just the dictionary lookup that makes its default translatable.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'

interface SpinnerProps {
  /** Explicit size in pixels (e.g. :size="32"). Without it: 1em — the spinner
   * follows the parent's text. */
  size?: number
  /** Label for screen readers. Default: the design system dictionary. */
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
    :style="size !== undefined ? { '--spinner-size': `${size}px` } : undefined"
    role="status"
  >
    <span class="v-spinner-circle" aria-hidden="true" />
    <span class="v-visually-hidden">{{ resolvedLabel }}</span>
  </span>
</template>

<style>
@layer vectis.components {
  .v-spinner {
    /* 1em: the spinner follows the parent's text (a consumer sizes it through
       font-size, e.g. VButton sets font-size: var(--vectis-icon-size) on its box).
       The `size` prop sets --spinner-size in px inline and wins. */
    --spinner-size: 1em;
    display: inline-flex;
  }

  .v-spinner-circle {
    width: var(--spinner-size);
    height: var(--spinner-size);
    /* Proportional thickness (a tolerated technical ratio, like the opacities):
       16px → 2px, 24px → 3px; 1px floor at very small sizes */
    border: max(1px, calc(var(--spinner-size) / 8)) solid
      color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--vectis-radius-full);
    animation: v-spin calc(var(--vectis-duration-slow) * 3.5) linear infinite;
  }

  /* The `v-spin` keyframe is shared (styles/utilities.css): global, hence outside
     any layer and declared once for the whole DS. */

  @media (prefers-reduced-motion: reduce) {
    .v-spinner-circle {
      animation-duration: calc(var(--vectis-duration-slow) * 8);
    }
  }
}
</style>
