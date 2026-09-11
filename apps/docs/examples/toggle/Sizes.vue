<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem, type ToggleSize } from 'vectis-ui'

const sizes: ToggleSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const selected = ref<Record<string, string>>({
  xs: 'week',
  sm: 'week',
  md: 'week',
  lg: 'week',
  xl: 'week',
  compact: 'week',
})
</script>

<template>
  <div class="demo">
    <!-- The scale shared by every control, set once on the group: each item is a
         button of that size, so a toggle row and a button beside it line up. -->
    <div v-for="size in sizes" :key="size" class="row">
      <p class="caption">{{ size }}</p>
      <VToggle v-model="selected[size]" :size="size" :label="`Period, ${size}`">
        <VToggleItem value="day" label="Day" />
        <VToggleItem value="week" label="Week" />
        <VToggleItem value="month" label="Month" />
      </VToggle>
    </div>

    <div class="row">
      <p class="caption">md compact</p>
      <VToggle v-model="selected.compact" size="md" compact label="Period, compact">
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
