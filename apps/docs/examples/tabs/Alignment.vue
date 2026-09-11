<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs, type TabsAlign } from 'vectis-ui'

const aligns: TabsAlign[] = ['start', 'center', 'end']
const selected = ref<Record<string, string>>({
  start: 'overview',
  center: 'overview',
  end: 'overview',
})
</script>

<template>
  <div class="demo">
    <!-- Where the tabs sit when they do not fill the bar. It is set on the bar and not
         on the list of tabs: pushing an overflowing list around would put whatever ran
         past the start edge out of reach. -->
    <div v-for="align in aligns" :key="align" class="row">
      <p class="caption">{{ align }}</p>
      <VTabs v-model="selected[align]" :align="align" :label="`Project, ${align}`">
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
