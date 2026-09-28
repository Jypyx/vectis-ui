<script setup lang="ts">
/**
 * Keep the outer snap area unanimated; transform only the inner box to avoid circular
 * dependencies between scroll position and snap geometry.
 */

import { inject } from 'vue'

import { carouselKey } from './context'

interface CarouselItemProps {
  /** Which slide this is among its siblings. */
  index?: number
}

const props = withDefaults(defineProps<CarouselItemProps>(), { index: 0 })

defineSlots<{
  /** The slide's content: an image, a card, free text. */
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
