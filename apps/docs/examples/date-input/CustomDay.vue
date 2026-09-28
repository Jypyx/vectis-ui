<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const night = ref<string | null>('2026-06-15')

/* Derive prices from dates so server and client render the same values. */
function priceFor(iso: string) {
  return 80 + ((Number(iso.slice(-2)) * 7) % 60)
}
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="night"
      mode="picker"
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
/* Inherit the selected day's foreground colour to preserve contrast. */
.price {
  font-size: var(--vectis-text-caption-size);
  line-height: 1;
  color: color-mix(in oklab, currentcolor 65%, transparent);
}
</style>
