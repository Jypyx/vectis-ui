<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs, type TabsTone, type TabsVariant } from 'vectis-ui'

const variants: TabsVariant[] = ['flat', 'outlined', 'inset']
const tones: TabsTone[] = ['accent', 'neutral', 'danger']

const selectedByVariant = ref<Record<string, string>>({
  flat: 'overview',
  outlined: 'overview',
  inset: 'overview',
})
const selectedByTone = ref<Record<string, string>>({
  accent: 'overview',
  neutral: 'overview',
  danger: 'overview',
})
</script>

<template>
  <div class="demo">
    <div v-for="value in variants" :key="value" class="row">
      <p class="caption">{{ value }}</p>
      <VTabs v-model="selectedByVariant[value]" :variant="value" :label="`Project, ${value}`">
        <VTab value="overview" label="Overview" />
        <VTab value="activity" label="Activity" />
        <VTab value="settings" label="Settings" />
      </VTabs>
    </div>

    <div v-for="value in tones" :key="value" class="row">
      <p class="caption">{{ value }}</p>
      <VTabs v-model="selectedByTone[value]" :tone="value" :label="`Project, ${value}`">
        <VTab value="overview" label="Overview" />
        <VTab value="activity" label="Activity" />
        <VTab value="settings" label="Settings" />
      </VTabs>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
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
