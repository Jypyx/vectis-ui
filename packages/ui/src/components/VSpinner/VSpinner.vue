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
   * A size in pixels, understood exactly as VIcon's: it is the BOX the spinner
   * occupies, not the diameter of the ring, which is drawn slightly smaller inside
   * it. Left out, the box measures 1em and therefore follows the size of the text
   * around it, which is how the spinner stays proportionate inside a button or a
   * paragraph without being told anything.
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
    /* `--spinner-size` is the BOX the spinner occupies, exactly as `--vectis-icon-size`
       is for VIcon — and not the diameter of the ring. Sized in `em`, that box follows
       the text of whatever contains it, so a consumer can size it through font-size
       alone — VButton, VInput and VTextarea do exactly that, from their icon size. The
       `size` prop writes this same variable in pixels, inline, and therefore wins.

       The ring is then drawn at five sixths of the box, because that is the proportion
       Material Symbols draws `progress_activity` at: on its 960 grid the outer radius
       is 400, so the ink spans 800 of the 960 the glyph is scaled into. Anything a
       spinner stands in for is an icon, and matching that fraction is what makes the
       two read as the same size instead of the spinner looking a size up. */
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
    /* The stroke is a tenth of the ring's diameter, the same source again: the glyph's
       outer radius is 400 and its inner one 320, so its stroke is 80 of those 800. It
       stays in proportion at every size, with a one-pixel floor below which the ring
       would disappear — a floor that only bites under a 12px box, which no size of the
       design system reaches. A bare ratio is tolerated here, like the opacities. */
    border: max(1px, calc(var(--spinner-ring) / 10)) solid
      color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--vectis-radius-full);
    animation: v-spin var(--vectis-duration-1000) linear infinite;
  }

  /* The `v-spin` keyframes live in styles/utilities.css, shared with
     VProgressCircular. Keyframes are global names rather than declarations arbitrated
     by the cascade, so they sit outside any layer and are declared once for the whole
     design system. */

  @media (prefers-reduced-motion: reduce) {
    .v-spinner-circle {
      animation-duration: var(--vectis-duration-3000);
    }
  }
}
</style>
