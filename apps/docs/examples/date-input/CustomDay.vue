<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const night = ref<string | null>('2026-06-15')

/* Derived from the date itself and never drawn at random: the server and the browser have
   to render the same figure, or hydration finds two calendars. */
function priceFor(iso: string) {
  return 80 + ((Number(iso.slice(-2)) * 7) % 60)
}
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="night"
      mode="readonly"
      min="2026-06-05"
      max="2026-06-24"
      label="Night"
      hint="The slot replaces the day number, so what it draws follows the selection"
    >
      <template #day="{ day, iso, inMonth, disabled }">
        <span class="number">{{ day }}</span>
        <small v-if="inMonth && !disabled" class="price">€{{ priceFor(iso) }}</small>
      </template>
    </VDateInput>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
.number {
  line-height: 1;
}
/* The price is set back from the number rather than given a colour of its own: mixing
   `currentcolor` towards transparent keeps it legible on the page AND on the accent a
   selected day is painted with, where a muted token would disappear. */
.price {
  font-size: var(--vectis-text-caption-size);
  line-height: 1;
  color: color-mix(in oklab, currentcolor 65%, transparent);
}
</style>
