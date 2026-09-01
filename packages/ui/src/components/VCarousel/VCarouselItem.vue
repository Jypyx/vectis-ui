<script setup lang="ts">
/**
 * One slide of a carousel: two boxes, and that split is the whole component.
 *
 * The OUTER one is the snap area and the view-timeline subject, and it is never animated.
 * That is correctness, not tidiness: a scroll-snap area is the element's TRANSFORMED border
 * box, so animating it would make its snap position depend on the scroll position — a
 * circular dependency whose symptom is jitter, with no error anywhere.
 *
 * The INNER one carries the effect. A named timeline resolves by walking up the tree, so
 * every slide shares one ident and each inner still finds its own.
 *
 * All of its styling lives in VCarousel's sheet, each rule qualified by the root's
 * orientation and effect. Split across two sheets they would be arbitrated by whatever
 * order the consumer's bundler chooses.
 */

import { inject } from 'vue'

import { carouselKey } from './context'

interface CarouselItemProps {
  /**
   * Which slide this is among its siblings. The carousel injects it as it renders them.
   *
   * NEVER pass it by hand: it is what makes the "3 of 8" a screen reader announces
   * identical on the server and in the browser.
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
