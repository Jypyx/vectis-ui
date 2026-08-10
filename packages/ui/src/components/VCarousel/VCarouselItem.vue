<script setup lang="ts">
import { inject } from 'vue'

import { carouselKey } from './context'

/**
 * One slide of a VCarousel. Two boxes, and that is the whole component:
 *
 * - `.v-carousel-slide` is the SCROLL-SNAP AREA and the view-timeline subject. It
 *   is never transformed — a snap area is the element's *transformed* border box,
 *   so animating it would make its snap position depend on the scroll position:
 *   a circular dependency whose symptom is jitter and drifting snap points, with
 *   no error anywhere.
 * - `.v-carousel-effect` carries the animation. It resolves the named timeline by
 *   walking up the tree, so every slide finds ITS OWN even though they all share
 *   the ident — no `timeline-scope` needed.
 *
 * All its styling lives in VCarousel's sheet (every rule is qualified by the
 * root's `data-orientation`/`data-effect`): split across two sheets, the rules
 * would be arbitrated by an order the consumer's bundler decides.
 */
interface CarouselItemProps {
  /**
   * Position among the sibling slides, injected by VCarousel through `cloneVNode`.
   * **Never pass it by hand** — it is what makes the "N of M" label identical on
   * the server and on the client.
   */
  index?: number
}

const props = withDefaults(defineProps<CarouselItemProps>(), { index: 0 })

defineSlots<{
  /** The slide's content — an image, a card, free text. */
  default(): unknown
}>()

const carousel = inject(carouselKey, null)
</script>

<template>
  <div
    class="v-carousel-slide"
    role="group"
    :aria-roledescription="carousel?.slideRoleDescription"
    :aria-label="carousel?.slideLabel(props.index)"
    :data-carousel-index="props.index"
  >
    <div class="v-carousel-effect"><slot /></div>
  </div>
</template>
