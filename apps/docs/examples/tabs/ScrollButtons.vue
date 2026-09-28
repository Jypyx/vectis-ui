<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const cities = ['Paris', 'Lisbon', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Prague', 'Oslo']
const horizontal = ref('Paris')
const vertical = ref('Paris')
</script>

<template>
  <div class="demo">
    <div class="narrow">
      <VTabs v-model="horizontal" scroll-buttons label="Cities">
        <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
      </VTabs>
    </div>

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
