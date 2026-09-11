<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem, type ToggleSelectedVariant } from 'vectis-ui'

const variants: ToggleSelectedVariant[] = ['solid', 'soft', 'ghost']
const selected = ref<Record<string, string>>({ solid: 'week', soft: 'week', ghost: 'week' })
</script>

<template>
  <div class="demo">
    <!-- How the chosen item is drawn, in the group's tone: filled with `solid`, tinted
         with `soft`, or the colour of its text alone with `ghost`. Solid is the loudest
         and the safest default; ghost is for a row that must stay quiet, where the
         difference rests on the text colour alone. -->
    <div v-for="variant in variants" :key="variant" class="row">
      <p class="caption">{{ variant }}</p>
      <VToggle
        v-model="selected[variant]"
        :selected-variant="variant"
        item-variant="outline"
        :label="`Period, ${variant}`"
      >
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
