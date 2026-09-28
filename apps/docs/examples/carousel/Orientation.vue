<script setup lang="ts">
import { VCarousel, VCarouselItem, VTypography } from 'vectis-ui'

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <div class="group">
    <VTypography variant="overline" tone="muted">horizontal</VTypography>
    <VCarousel label="Horizontal gallery">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
      </VCarouselItem>
    </VCarousel>
  </div>

  <div class="group">
    <VTypography variant="overline" tone="muted">vertical</VTypography>
    <VCarousel orientation="vertical" height="14rem" label="Vertical gallery">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide fill" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
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
/* Let content fill the carousel's assigned slide height. */
.fill {
  block-size: 100%;
}
</style>
