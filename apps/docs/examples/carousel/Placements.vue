<script setup lang="ts">
import {
  VCarousel,
  VCarouselItem,
  VTypography,
  type CarouselControls,
  type CarouselIndicators,
} from 'vectis-ui'

const placements: {
  caption: string
  controls: CarouselControls
  indicators: CarouselIndicators
}[] = [
  { caption: 'arrows inside, dots outside', controls: 'inside', indicators: 'outside' },
  { caption: 'arrows inside, dots inside', controls: 'inside', indicators: 'inside' },
  { caption: 'arrows outside, dots outside', controls: 'outside', indicators: 'outside' },
  { caption: 'arrows outside, dots inside', controls: 'outside', indicators: 'inside' },
]

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <div v-for="placement in placements" :key="placement.caption" class="group">
    <VTypography variant="overline" tone="muted">{{ placement.caption }}</VTypography>
    <VCarousel
      :controls="placement.controls"
      :indicators="placement.indicators"
      :label="placement.caption"
    >
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
