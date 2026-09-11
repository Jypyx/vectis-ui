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
    <!-- Two decisions in one word. `flat` draws a rule under the tabs and underlines
         the selected one; `outlined` puts that same bar and its panels inside a card;
         `inset` turns the row into a segmented control in a hollow track. -->
    <div v-for="value in variants" :key="value" class="row">
      <p class="caption">{{ value }}</p>
      <VTabs v-model="selectedByVariant[value]" :variant="value" :label="`Project, ${value}`">
        <VTab value="overview" label="Overview" />
        <VTab value="activity" label="Activity" />
        <VTab value="settings" label="Settings" />
      </VTabs>
    </div>

    <!-- The tone colours the selected tab and nothing else: the others stay neutral
         whatever it says, since only one of them is making a claim. -->
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
