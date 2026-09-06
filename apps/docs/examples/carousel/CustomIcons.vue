<script setup lang="ts">
import { VCarousel, VCarouselItem, VTypography } from 'vectis-ui'
import {
  chevron_left as chevronLeft,
  chevron_right as chevronRight,
  expand_less as expandLess,
  expand_more as expandMore,
} from 'vectis-ui/icons'

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <div class="group">
    <VTypography variant="overline" tone="muted">chevrons</VTypography>
    <VCarousel label="Chevron controls" :prev-icon="chevronLeft" :next-icon="chevronRight">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
      </VCarouselItem>
    </VCarousel>
  </div>

  <div class="group">
    <VTypography variant="overline" tone="muted">carets</VTypography>
    <VCarousel
      orientation="vertical"
      height="14rem"
      label="Caret controls"
      :prev-icon="expandLess"
      :next-icon="expandMore"
    >
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
.fill {
  block-size: 100%;
}
</style>
