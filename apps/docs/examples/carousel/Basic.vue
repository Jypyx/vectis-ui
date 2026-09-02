<script setup lang="ts">
import { ref } from 'vue'
import { VCarousel, VCarouselItem } from 'vectis-ui'

const slide = ref(0)
</script>

<template>
  <VCarousel v-model="slide" label="Gallery">
    <VCarouselItem><p class="slide">First slide</p></VCarouselItem>
    <VCarouselItem><p class="slide">Second slide</p></VCarouselItem>
    <VCarouselItem><p class="slide">Third slide</p></VCarouselItem>
  </VCarousel>
</template>

<style scoped>
/* A slide has no height of its own: it takes the one its content brings. */
.slide {
  display: grid;
  place-items: center;
  block-size: 12rem;
  margin: 0;
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-surface-muted);
}
</style>
