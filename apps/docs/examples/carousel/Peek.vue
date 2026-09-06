<script setup lang="ts">
import { VCarousel, VCarouselItem } from 'vectis-ui'

const products = ['Kettle', 'Toaster', 'Blender', 'Grinder', 'Scale', 'Press']
const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <VCarousel label="Product list" :items-per-view="2" peek="3rem">
    <VCarouselItem v-for="(product, i) in products" :key="product">
      <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hues[i]})` }">{{ product }}</p>
    </VCarouselItem>
  </VCarousel>
</template>

<style scoped>
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
