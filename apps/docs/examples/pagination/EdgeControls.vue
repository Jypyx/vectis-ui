<script setup lang="ts">
import { ref } from 'vue'
import { VPagination } from 'vectis-ui'

const page = ref(5)
</script>

<template>
  <div class="column">
    <VPagination
      v-model="page"
      :length="20"
      :total-visible="7"
      edge-controls
      item-variant="outline"
      label="Pages with first and last controls"
    />
    <VPagination
      v-model="page"
      :length="20"
      :total-visible="7"
      edge-controls
      controls="both"
      item-variant="outline"
      label="Pages with first and last controls, with text"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
</style>
