<script setup lang="ts">
import { inject } from 'vue'

import { carouselKey } from './context'

/**
 * One slide of a carousel. It renders two boxes, and that split is the whole component.
 *
 * The OUTER one is what the carousel snaps to, and it is never animated. That is not
 * tidiness: the box a scroller snaps to is the element's TRANSFORMED one, so animating it
 * would make where it snaps depend on how far the scroller has been scrolled — a circle
 * whose symptom is jitter and snap positions that drift, with no error anywhere to explain
 * it.
 *
 * The INNER one carries the transition. It finds the timeline of ITS OWN slide by walking
 * up the tree, which is why every slide can share the same name without anything having to
 * scope them apart.
 *
 * All of its styling lives in VCarousel's stylesheet, every rule being conditioned on the
 * carousel's orientation and effect. Split across two sheets, those rules would be
 * arbitrated by an order the consumer's bundler decides.
 */
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
