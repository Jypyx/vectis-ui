<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCarousel, VCarouselItem } from 'vectis-ui'

/* The stop control the component leaves to you: the prop is reactive, so 0 cancels the
   timer on the spot. Hover and keyboard focus already hold the rotation, which leaves a
   touch user with nothing without this button. */
const paused = ref(false)

const hues = [220, 280, 340, 20, 90, 160]
</script>

<template>
  <div class="group">
    <VButton variant="outline" tone="neutral" size="sm" class="stop" @click="paused = !paused">
      {{ paused ? 'Resume' : 'Pause' }}
    </VButton>

    <VCarousel :autoplay="paused ? 0 : 3000" label="Rotating gallery">
      <VCarouselItem v-for="(hue, i) in hues" :key="hue">
        <p class="slide" :style="{ background: `oklch(0.45 0.15 ${hue})` }">{{ i + 1 }}</p>
      </VCarouselItem>
    </VCarousel>
  </div>
</template>

<style scoped>
.group {
  display: grid;
  gap: var(--vectis-space-3);
}
.stop {
  justify-self: start;
}
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
