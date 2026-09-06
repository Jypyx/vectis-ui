<script setup lang="ts">
import { VCarousel, VCarouselItem, VTypography } from 'vectis-ui'

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <div class="group">
    <VTypography variant="overline" tone="muted">straight there, the default</VTypography>
    <VCarousel effect="fade" label="Jumping gallery">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
      </VCarouselItem>
    </VCarousel>
  </div>

  <div class="group">
    <VTypography variant="overline" tone="muted">the whole travel</VTypography>
    <VCarousel effect="fade" no-jump label="Travelling gallery">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
      </VCarouselItem>
    </VCarousel>
  </div>
</template>

<style scoped>
.group {
  display: grid;
  gap: var(--vectis-space-2);
}
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
