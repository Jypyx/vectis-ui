<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const joined = ref(3)
const detached = ref(3)
</script>

<template>
  <div class="column">
    <!-- Joined, the shadow is the ROW's: one per pill would fall into every joint,
         the segments overlapping by a pixel. -->
    <div class="row">
      <VPagination
        v-model="joined"
        :length="6"
        elevated
        item-variant="outline"
        label="Raised joined pages"
      />
      <VTypography variant="caption" tone="muted">elevated</VTypography>
    </div>

    <div class="row">
      <VPagination
        v-model="detached"
        :length="6"
        elevated
        detached
        item-variant="outline"
        label="Raised detached pages"
      />
      <VTypography variant="caption" tone="muted">elevated, detached</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-6);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
