<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const page = ref(3)
const first = ref(1)
const last = ref(6)
</script>

<template>
  <div class="column">
    <div class="row">
      <VPagination
        v-model="page"
        :length="6"
        disabled
        controls="both"
        item-variant="outline"
        label="Pages unavailable"
      />
      <VTypography variant="caption" tone="muted">The whole row switched off</VTypography>
    </div>

    <!-- The controls disable themselves at the ends: there is nothing to step to. -->
    <div class="row">
      <VPagination
        v-model="first"
        :length="6"
        controls="both"
        item-variant="outline"
        label="On the first page"
      />
      <VTypography variant="caption" tone="muted">On the first page</VTypography>
    </div>

    <div class="row">
      <VPagination
        v-model="last"
        :length="6"
        controls="both"
        item-variant="outline"
        label="On the last page"
      />
      <VTypography variant="caption" tone="muted">On the last page</VTypography>
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
