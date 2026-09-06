<script setup lang="ts">
import { VCarousel, VCarouselItem } from 'vectis-ui'

/* Flat colours rather than pictures, so one slide is told from the next at a glance. */
const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <VCarousel label="Three at a time" :items-per-view="3" :item-min-size="180">
    <VCarouselItem v-for="(hue, i) in hues" :key="hue">
      <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
    </VCarouselItem>
  </VCarousel>
</template>

<style scoped>
/* A slide has no height of its own: it takes the one its content brings. */
.slide {
  display: grid;
  place-items: center;
  block-size: 10rem;
  margin: 0;
  border-radius: var(--vectis-radius-surface);
  color: var(--vectis-color-text-on-accent);
  font-size: var(--vectis-text-heading-3-size);
  font-weight: var(--vectis-text-heading-3-weight);
}
</style>
