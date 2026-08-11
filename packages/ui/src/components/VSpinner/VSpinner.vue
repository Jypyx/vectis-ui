<script setup lang="ts">
// @a11y
/**
 * A turning ring saying that something is under way. The animation is pure CSS; what
 * makes the component more than a decorated circle is that it also announces itself:
 * it carries `role="status"` and a label only screen readers see, so the wait is
 * heard as well as seen, without adding any text to the design.
 *
 * The single line of JavaScript reads the label from the dictionary, which is what
 * makes its default translatable. It is not behaviour: no event, no lifecycle, no
 * DOM access.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'

interface SpinnerProps {
  /**
   * A size in pixels. Left out, the spinner measures 1em and therefore follows the
   * size of the text around it, which is how it stays proportionate inside a button
   * or a paragraph without being told anything.
   */
  size?: number
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
    /* Sized in `em`, the spinner follows the text of whatever contains it, so a
       consumer can size it through font-size alone — VButton does exactly that on
       the box holding it. The `size` prop writes this same variable in pixels,
       inline, and therefore wins. */
    --spinner-size: 1em;
    display: inline-flex;
  }

  .v-spinner-circle {
    width: var(--spinner-size);
    height: var(--spinner-size);
    /* The stroke is an eighth of the diameter, so it stays in proportion at every
       size — 2px at 16, 3px at 24 — with a one-pixel floor below which the ring
       would disappear. A bare ratio is tolerated here, like the opacities. */
    border: max(1px, calc(var(--spinner-size) / 8)) solid
      color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--vectis-radius-full);
    animation: v-spin calc(var(--vectis-duration-slow) * 3.5) linear infinite;
  }

  /* The `v-spin` keyframes live in styles/utilities.css, shared with
     VProgressCircular. Keyframes are global names rather than declarations arbitrated
     by the cascade, so they sit outside any layer and are declared once for the whole
     design system. */

  @media (prefers-reduced-motion: reduce) {
    .v-spinner-circle {
      animation-duration: calc(var(--vectis-duration-slow) * 8);
    }
  }
}
</style>
