<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs, type TabsSize } from 'vectis-ui'

const sizes: TabsSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const selected = ref<Record<string, string>>({
  xs: 'overview',
  sm: 'overview',
  md: 'overview',
  lg: 'overview',
  xl: 'overview',
  compact: 'overview',
})
</script>

<template>
  <div class="demo">
    <div v-for="size in sizes" :key="size" class="row">
      <p class="caption">{{ size }}</p>
      <VTabs v-model="selected[size]" :size="size" :label="`Project, ${size}`">
        <VTab value="overview" label="Overview" />
        <VTab value="activity" label="Activity" />
      </VTabs>
    </div>

    <div class="row">
      <p class="caption">md compact</p>
      <VTabs v-model="selected.compact" size="md" compact label="Project, compact">
        <VTab value="overview" label="Overview" />
        <VTab value="activity" label="Activity" />
      </VTabs>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
