<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const joined = ref(3)
const detached = ref(3)
</script>

<template>
  <div class="column">
    <div class="row">
      <VPagination v-model="joined" :length="6" item-variant="outline" label="Joined pages" />
      <VTypography variant="caption" tone="muted">Joined, the default</VTypography>
    </div>

    <!-- The same word, in the same direction, as VButtonGroup and VToggle: the buttons
         are spaced and each keeps its own corners. -->
    <div class="row">
      <VPagination
        v-model="detached"
        :length="6"
        detached
        item-variant="outline"
        label="Detached pages"
      />
      <VTypography variant="caption" tone="muted">detached</VTypography>
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
