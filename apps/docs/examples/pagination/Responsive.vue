<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const page = ref(8)
</script>

<template>
  <div class="column">
    <VTypography variant="body-sm" tone="muted">
      Drag the handle at the corner: the neighbours of the current page go one step at a time, while
      the first page, the last and the current one never do.
    </VTypography>

    <!-- The row asks about its OWN width rather than the window's, so it sheds pages
         inside a narrow panel while the page around it stays wide. -->
    <div class="box">
      <VPagination
        v-model="page"
        :length="16"
        responsive
        controls="both"
        align="center"
        item-variant="outline"
        label="Sixteen pages in a narrow panel"
      />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
}
.box {
  overflow: auto;
  inline-size: 38rem;
  min-inline-size: 14rem;
  max-inline-size: 100%;
  padding: var(--vectis-space-3);
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
  resize: horizontal;
}
</style>
