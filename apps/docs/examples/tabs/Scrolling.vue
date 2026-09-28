<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from 'vectis-ui'

const cities = ['Paris', 'Lisbon', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Prague', 'Oslo']
const tab = ref('Paris')
</script>

<template>
  <div class="narrow">
    <VTabs v-model="tab" label="Cities">
      <VTab v-for="city in cities" :key="city" :value="city" :label="city" />
    </VTabs>
  </div>
</template>

<style scoped>
.narrow {
  /* Allow the container to shrink so the tab list can overflow. */
  min-inline-size: 0;
  max-inline-size: 26rem;
}
</style>
