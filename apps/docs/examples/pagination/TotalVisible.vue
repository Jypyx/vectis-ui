<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const page = ref(1)
</script>

<template>
  <div class="column">
    <!-- The count is CONSTANT: the ellipses are slots like the pages, so the row keeps
         exactly the same width whichever page is current. Walk through it and nothing
         moves sideways. -->
    <div v-for="slots in [5, 7, 9]" :key="slots" class="row">
      <VPagination
        v-model="page"
        :length="20"
        :total-visible="slots"
        item-variant="outline"
        :label="`Twenty pages in ${slots} slots`"
      />
      <VTypography variant="caption" tone="muted">totalVisible {{ slots }}</VTypography>
    </div>

    <VTypography variant="body-sm" tone="muted">Page {{ page }} of 20</VTypography>
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
