<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const short = ref(2)
const long = ref(7)
</script>

<template>
  <div class="column">
    <div class="row">
      <VPagination v-model="short" :length="4" item-variant="outline" label="Four pages" />
      <VTypography variant="caption" tone="muted">length 4</VTypography>
    </div>

    <!-- Every page is rendered unless `totalVisible` says how many slots to keep. -->
    <div class="row">
      <VPagination v-model="long" :length="12" item-variant="outline" label="Twelve pages" />
      <VTypography variant="caption" tone="muted">length 12</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
