<script setup lang="ts">
import { VCarousel, VCarouselItem } from 'vectis-ui'

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <VCarousel loop label="Looping gallery">
    <VCarouselItem v-for="(hue, i) in hues" :key="hue">
      <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
    </VCarouselItem>
  </VCarousel>
</template>

<style scoped>
.slide {
  display: grid;
  place-items: center;
  block-size: 12rem;
  margin: 0;
  border-radius: var(--vectis-radius-surface);
  color: var(--vectis-color-text-on-accent);
  font-size: var(--vectis-text-heading-3-size);
  font-weight: var(--vectis-text-heading-3-weight);
}
</style>
