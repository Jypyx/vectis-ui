<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem, type ToggleItemVariant, type ToggleTone } from 'vectis-ui'

const itemVariants: ToggleItemVariant[] = ['ghost', 'outline']
const tones: ToggleTone[] = ['accent', 'neutral', 'danger']

const byVariant = ref<Record<string, string>>({ ghost: 'week', outline: 'week' })
const byTone = ref<Record<string, string>>({ accent: 'week', neutral: 'week', danger: 'week' })
</script>

<template>
  <div class="demo">
    <!-- `itemVariant` paints the items that are NOT chosen: transparent under `ghost`,
         outlined under `outline`. What the chosen one takes is a separate decision. -->
    <div v-for="variant in itemVariants" :key="variant" class="row">
      <p class="caption">itemVariant {{ variant }}</p>
      <VToggle v-model="byVariant[variant]" :item-variant="variant" :label="`Period, ${variant}`">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <!-- The tone colours the chosen item and nothing else: the rest stay neutral,
         since only one of them is making a claim. -->
    <div v-for="tone in tones" :key="tone" class="row">
      <p class="caption">tone {{ tone }}</p>
      <VToggle
        v-model="byTone[tone]"
        :tone="tone"
        item-variant="outline"
        :label="`Period, ${tone}`"
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
