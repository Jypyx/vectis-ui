<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const cities = ['Paris', 'Lisbon', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Prague', 'Oslo']
const horizontal = ref('Paris')
const vertical = ref('Paris')
</script>

<template>
  <div class="demo">
    <!-- A button at each end, disabled once that end is reached, for a pointer that has
         no wheel to scroll with. They are opt-in: on a bar that never overflows they
         would be two permanently disabled controls. -->
    <div class="narrow">
      <VTabs v-model="horizontal" scroll-buttons label="Cities">
        <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
      </VTabs>
    </div>

    <!-- Vertically the buttons move to the top and bottom of the column, and their
         icons follow the axis without being asked. -->
    <div class="short">
      <VTabs v-model="vertical" orientation="vertical" scroll-buttons label="Cities, vertical">
        <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
      </VTabs>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-6);
}
.narrow {
  min-inline-size: 0;
  max-inline-size: 26rem;
}
.short {
  block-size: 14rem;
}
</style>
